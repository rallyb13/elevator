import Ember from 'ember';

export default Ember.Component.extend({
  // Services
  elevatorService: Ember.inject.service('elevator-control'),

  // Properties
  activeFloor: 2,
  hasStarted: false,

  // Hooks
  didRender() {
    if (this.get('hasStarted') === false) {
      this.get('elevatorService').handleTime();
      this.set('hasStarted', true); // TODO: elim hasStarted && check if poss
    }
  },

  // Actions
  actions: {
    callElevator(isGoingUp) {
      const elevatorServ = this.get('elevatorService');
      elevatorServ.summonElevator(this.activeFloor, isGoingUp);
      // TODO: add UI for showing button is pressed && logic: if it's pressed don't call again
    }
  }
});
