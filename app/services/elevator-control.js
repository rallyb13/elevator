import Ember from 'ember';
const {ActionHandler} = Ember;

/*************** SERVICE ******************
* Service for controlling the elevators: moving them and handling all data
* related to where they still need to go.
* @class Service.ElevatorControl
* @constructor
* @extends Ember.Service
*/
export default Ember.Service.extend(ActionHandler, {
  /****************** PROPERTIES ******************
  * floor of waiting area
  * @property
  * @type {Number}
  * @default 1
  */
  activeFloor: 1,

  /**
  * Only false when ALL elevators have stopped
  * @property
  * @type {Boolean}
  * @default true
  */
  isSystemActive: true,

  /**
  * data relating to changing activeFloor with elevator
  * @property
  * @type {Object.<Number>}
  * @default nulls
  */
  rideAlong: {elevator: null, destination: null},

  /**
  * id for timeout function, used to clear old timeout count when a new request
  * comes in
  * @property
  * @type {Number}
  * @default 0
  */
  timerId: 0,

  /**
  * data for all elevator statuses, including current floor and all floors
  * elevator is headed toward, whether elevator is moving, which direction, and
  * door open/closed status (with counter)
  * @property
  * @type {Array.<Object>}
  */
  elevators: [
    {
      isDoorOpen: false,
      doorCount: 3,
      isInTransit: true,
      isGoingUp: false,
      currentFloor: 7,
      destinationFloor: 2,
      stops: [5],
      track: 0
    },
    {
      isDoorOpen: false,
      doorCount: 2,
      isInTransit: false,
      isGoingUp: false,
      currentFloor: 1,
      destinationFloor: 1,
      stops: [],
      track: 1
    },
    {
      isDoorOpen: false,
      doorCount: 3,
      isInTransit: true,
      isGoingUp: true,
      currentFloor: 3,
      destinationFloor: 18,
      stops: [9, 4, 14],
      track: 2
    }
  ],

  /****************** METHODS ******************
  * When an elevator is called, this function uses the floor of the call and the
  * requested direction to determine which elevator is closest and assigns a
  * stop at that floor to a specific elevator
  *
  * @private
  * @param {Number} floor Where the elevator is being summoned to
  * @param {Boolean} isUp Requested direction for elevator to move upon arrival at floor
  * @return undefined
  */
  summonElevator: function(floor, isUp) {
    let index = 3,
      score = 0,
      bestScore = 100;

      this.get('elevators').forEach((elevator, i) => {
      const current = elevator.currentFloor,
        dest = elevator.destinationFloor;

      if (elevator.isInTransit === false) {
        // if elevator not in use
        score = Math.abs(current - floor);
      } else if (elevator.isGoingUp !== isUp) { // TODO: add count of stops to score && intent!
        // if elevator is heading opposite direction TODO: flag to skip floor if pass before changing direction?
        score = Math.abs(current - dest);
        score += Math.abs(dest - floor);
      } else {
        // if elevator is heading same direction &&
        if (floor === current) {
          // elevator is there
          score = 0;
        } else if (isUp === floor > current) {
          // elevator is on its way there
          score = Math.abs(current - floor);
        } else {
          // elevator has already passed
          score = Math.abs(current - dest);
          score += Math.abs(dest - floor);
        }
      }

      if (score < bestScore) {
        index = i;
        bestScore = score;
      }
    });

    this.assignElevator(index, floor, isUp);
  },

  /**
  * TODO: notify whether assignment came from inside/outside el, to allow for recorded intent
  * handles directing a specific elevator to stop at a specific floor
  * @private
  * @param {Number} index identifies specific elevator being assigned
  * @param {Number} floor Where the elevator is being summoned to
  * @param {Boolean} isUp Requested direction for elevator (only from call button)
  * @return undefined
  */
  assignElevator(index, floor, isUp) {
    const selectedEl = this.get('elevators')[index];
    let shouldGoUp = floor > selectedEl.currentFloor;

    if (floor === selectedEl.currentFloor && typeof isUp !== 'undefined') {
      shouldGoUp = isUp;
    }

    if (selectedEl.isInTransit === false){
      Ember.set(selectedEl, 'isInTransit', true);
      Ember.set(selectedEl, 'isGoingUp', shouldGoUp);
      Ember.set(selectedEl, 'destinationFloor', floor);
    } else if (selectedEl.destinationFloor !== floor) {
      if (selectedEl.isGoingUp === (floor < selectedEl.destinationFloor)) {
        if (selectedEl.stops.indexOf(floor) === -1) {
          selectedEl.stops.pushObject(floor);
        }
      } else {
        selectedEl.stops.pushObject(selectedEl.destinationFloor);
        Ember.set(selectedEl, 'destinationFloor', floor);
      }
    }
    this.handleMotion();
  },

  /**
  * TODO switch to setInterval
  * Handles timeouts to move elevator every second, clearing timeouts when
  * additional requests are made (calls handleMotion, which can call handelTime
  * again)
  *
  * @private
  * @return undefined
  */
  handleTime() {
    const me = this;
    let timeoutId = this.get('timerId');
    window.clearTimeout(timeoutId);
    if (this.get('isSystemActive') === true) {
      timeoutId = window.setTimeout(function () {
        me.handleMotion();
      }, 1000);
      this.set('timerId', timeoutId);
    }
  },

  /**
  * TODO: preserve INTENT for summoned elevator on its last stop if a pickup (to go up, to go down)
  * puts elevators in motion by changing the elevators object to reflect the next
  * state of each elevator (including leaving time for doors to open/close)
  * @private
  * @return undefined
  */
  handleMotion() {
    const movingEls = this.get('elevators').filter(obj => obj.isInTransit === true);
    let change = 1,
      newStops = [],
      newDest = 0;

    this.set('isSystemActive', true);
    movingEls.forEach((elev) => {
      let elData = this.get('elevators')[elev.track];

      if (elev.isDoorOpen === true) {
        // Hodor
        if (elev.doorCount > 0) {
          Ember.set(elData, 'doorCount', elev.doorCount - 1);
        } else {
          Ember.set(elData, 'isDoorOpen', false);
          Ember.set(elData, 'doorCount', 3); // reset door timer
        }
      } else {
        if (elev.destinationFloor === elev.currentFloor) {
          // reaches destination
          Ember.set(elData, 'isDoorOpen', true);
          if (elev.stops.length === 0) {
            Ember.set(elData, 'isInTransit', false);
          } else {
            newStops = elev.stops; // TODO: sort first so that additional calls don't get confused over destination (not important for current-possible UX)
            newDest = newStops.shift();
            Ember.set(elData, 'destinationFloor', newDest);
            Ember.set(elData, 'stops', newStops);
            Ember.set(elData, 'isGoingUp', newDest > elev.currentFloor);
          }
        } else if (elev.stops.indexOf(elev.currentFloor) !== -1) {
          // open doors at a stop
          Ember.set(elData, 'isDoorOpen', true);
          newStops = elev.stops;
          newStops.splice(elev.stops.indexOf(elev.currentFloor), 1);
          Ember.set(elData, 'stops', newStops);
        } else {
          // or move elevator
          change = elev.isGoingUp ? 1 : -1;
          Ember.set(elData, 'currentFloor', elev.currentFloor + change);
        }
      }
    });

    if (movingEls.length === 0) {
      this.set('isSystemActive', false);
    } else {
      this.handleRide();
      this.handleTime();
    }
  },

  /**
  * store data in rideAlong property to initiate changing activeFloor with elevator
  * @private
  * @param {Number} index The id of the elevator in which selection is made
  * @param {Number} floor The floor elevator is directed to
  * @return undefined
  */
  startRide(index, floor) {
    this.set('rideAlong', {elevator: index, destination: floor});
  },

  /**
  * check for rideAlong data; adjust activeFloor when present and reset at end
  * @private
  * @return undefined
  */
  handleRide() {
    const rideData = this.get('rideAlong');

    if (rideData.elevator !== null) {
      const elevatorFloor = this.get('elevators')[rideData.elevator].currentFloor;
      this.set('activeFloor', elevatorFloor);
      if(elevatorFloor === rideData.destination) {
        this.set('rideAlong', {elevator: null, destination: null});
      }
    }
  }

});
