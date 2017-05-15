import Ember from 'ember';
const {ActionHandler} = Ember;

export default Ember.Service.extend(ActionHandler, {
  // State
  isPersOnBoard: false, // Pers = person/perspective
  elevators: [
    {
      isDoorOpen: false,
      isInTransit: true,
      isGoingUp: false,
      currentFloor: 7,
      destinationFloor: 2,
      stops: [4]
    },
    {
      isDoorOpen: true,
      isInTransit: false,
      isGoingUp: false,
      currentFloor: 1,
      destinationFloor: 1,
      stops: []
    },
    {
      isDoorOpen: false,
      isInTransit: true,
      isGoingUp: true,
      currentFloor: 3,
      destinationFloor: 18,
      stops: [9, 4, 14]
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
      } else if (this.elevators[i].isGoingUp !== isUp) {
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
    // TODO: check if doors open when on current floor once adding info in, or if just miss
    if (selectedEl.isInTransit === false){
      selectedEl.isInTransit = true;
      selectedEl.isGoingUp = isUp;
    }

    if (selectedEl.destinationFloor !== floor) {
      if (isUp === floor < selectedEl.destinationFloor) {
        selectedEl.stops.push(floor);
      } else {
        selectedEl.stops.push(selectedEl.destinationFloor);
        selectedEl.destinationFloor = floor;
      }
    }
  }

  /*TODO: write more functionality:
  * add destination (in elevator)
  * check for stops, as part of handle doors & motion [this function is called by time to refresh data]
  */
});
