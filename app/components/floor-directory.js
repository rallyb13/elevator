import Ember from 'ember';

export default Ember.Component.extend({
  elevatorService: Ember.inject.service('elevator-control'),

  chosenFloor: null,
  elId: null,
  floors: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],

  actions: {
    chooseFloor(index, floor) {
      const elevatorServ = this.get('elevatorService');
      elevatorServ.assignElevator(index, floor);
      this.set('chosenFloor', floor);
    },

    doComeAlong(index) {
      const elevatorServ = this.get('elevatorService');
      elevatorServ.startRide(index, this.get('chosenFloor'));
      this.set('chosenFloor', null); //TODO: find reset for all cases, not just after use
    }
  }
});
