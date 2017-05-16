import Ember from 'ember';

export default Ember.Component.extend({
  //************** Services **************
  elevatorService: Ember.inject.service('elevator-control'),

  /*************** Properties **************
  * current active floor that you're viewing elevators on
  * @property
  * @type {Number}
  * @default 1
  */

  /************** Hooks *************
  * use didRender to start elevators, but only make call once (continual running
  * is handled by handleTime function once it's been called)
  * @event didRender
  * @return undefined
  */
  didInsertElement() {
    this.get('elevatorService').handleTime();
  },

  actions: {
    /************** Actions *************
    * calls service to inform what floor (and for what direction) elevator has
    * been called
    * @public
    * @param {Boolean} isGoingUp The direction summoner intends to travel
    */
    callElevator(isGoingUp) {
      const elevatorServ = this.get('elevatorService');
      elevatorServ.summonElevator(elevatorServ.activeFloor, isGoingUp);
      // TODO: add UI for showing button is pressed && logic: if it's pressed don't call again
    }
  }
});
