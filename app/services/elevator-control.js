import Ember from 'ember';
const {ActionHandler} = Ember;

export default Ember.Service.extend(ActionHandler, {
  // State
  isPersOnBoard: false, // Pers = person/perspective
  isSystemActive: true,
  timerId: 0,
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

  // Methods
  summonElevator: function(floor, isUp) { //TODO: decompose into select elevator & assign elevator job?
    let index = 3,
      score = 0,
      bestScore = 100,
      selectedEl = {};

    for (let i=0; i<this.elevators.length; i++) {
      const current = this.elevators[i].currentFloor,
        dest = this.elevators[i].destinationFloor;

      if (this.elevators[i].isInTransit === false) {
        // if elevator not in use
        score = Math.abs(current - floor);
      } else if (this.elevators[i].isGoingUp !== isUp) { // TODO: add count of stops to score
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
    }

    selectedEl = this.elevators[index];
    // now add assignment into elevator data
    // TODO: check if doors can open first when on current floor once adding info in, or if just miss (becomes off by one error)
    if (selectedEl.isInTransit === false){
      Ember.set(selectedEl, 'isInTransit', true);
      Ember.set(selectedEl, 'isGoingUp', isUp);
      Ember.set(selectedEl, 'destinationFloor', floor);
    } else if (selectedEl.destinationFloor !== floor) {
      if (isUp === floor < selectedEl.destinationFloor) {
        selectedEl.stops.pushObject(floor);
      } else {
        selectedEl.stops.pushObject(selectedEl.destinationFloor);
        Ember.set(selectedEl, 'destinationFloor', floor);
      }
    }
    this.handleMotion();
  },

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

  handleMotion() {
    const movingEls = this.elevators.filter(obj => obj.isInTransit === true);
    let change = 1,
      newStops = [],
      newDest = 0;

    this.set('isSystemActive', true);
    for (let i=0; i<movingEls.length; i++) {
      let elev = movingEls[i],
        elData = this.elevators[elev.track];

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
          newStops = elev.stops
          newStops.splice(elev.stops.indexOf(elev.currentFloor), 1);
          Ember.set(elData, 'stops', newStops);
        } else {
          // or move elevator
          change = elev.isGoingUp ? 1 : -1;
          Ember.set(elData, 'currentFloor', elev.currentFloor + change);
        }
      }
    }
    if (movingEls.length === 0) {
      this.set('isSystemActive', false);
    } else {
      this.handleTime();
    }



  }

  /*TODO: write more functionality:
  * add destination (in elevator)
  * check for stops, as part of handle doors & motion [this function is called by time interval to refresh data]
  */
});
