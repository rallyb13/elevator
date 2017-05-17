import Ember from 'ember';

export default Ember.Component.extend({
  elevatorService: Ember.inject.service('elevator-control'),

  /*************** Properties **************
  * current active floor that you're viewing elevators on
  * @property
  * @type {Number}
  * @default 1
  */

  /************** Hooks *************
  * use didInsertElement to start elevators (only once)
  * @event didRender
  * @return undefined
  */
  didInsertElement() {
    this.get('elevatorService').handleTime();
  },

  //----------------- ACTIONS ---------------
  actions: {
    /**
    * TODO: add UI for showing button is pressed and maybe logic:
    *     if it's pressed don't call again
    * calls service to inform what floor (and for what direction) elevator has
    * been called
    * @public
    * @param {Boolean} isGoingUp The direction summoner intends to travel
    */
    callElevator(isGoingUp) {
      const elevatorServ = this.get('elevatorService');
      elevatorServ.summonElevator(elevatorServ.activeFloor, isGoingUp);
    }
  }
});
