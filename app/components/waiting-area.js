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
  activeFloor: 5,

  /**
  * whether the elevator motion has begun yet
  * @property
  * @type {Boolean}
  * @default false
  */
  hasStarted: false,

  /************** Hooks *************
  * use didRender to start elevators, but only make call once (continual running
  * is handled by handleTime function once it's been called)
  * @event didRender
  * @return undefined
  */
  didRender() {
    if (this.get('hasStarted') === false) {
      this.get('elevatorService').handleTime();
      this.set('hasStarted', true);
    }
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
      elevatorServ.summonElevator(this.activeFloor, isGoingUp);
      // TODO: add UI for showing button is pressed && logic: if it's pressed don't call again
    }
  }
});
