import Ember from 'ember';

export default Ember.Component.extend({
  elevatorService: Ember.inject.service('elevator-control'),

  /**************** Properties ************
  * floor selection made in chooseFloor action, referenceable by doComeAlong
  * @property
  * @type {Number}
  * @default null
  */
  chosenFloor: null,

  /**
  * id of elevator, passed down from waiting-area
  * @property
  * @type {Number}
  * @default null
  */
  elId: null,

  /**
  * all possible floors; while I would *like* to make this just a range, but
  * could eventually play with B, B2, L instead of 1, and skipping 13
  * @property
  * @type {Array.<Number>}
  */
  floors: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],

  //----------------- ACTIONS ---------------
  actions: {
    /**
    * passes info to service to move elevator when in-elevator selection made
    * @public
    * @param {Number} index The id of the elevator in which selection is made
    * @param {Number} floor The floor elevator is directed to
    */
    chooseFloor(index, floor) {
      const elevatorServ = this.get('elevatorService');
      elevatorServ.assignElevator(index, floor);
      this.set('chosenFloor', floor);
    },

    /**
    * TODO: reset button for all cases, not just after come along clicked
    * passes info to service if waiting area should change with elevator
    * @param {Number} index The id of the elevator in which selection is made
    */
    doComeAlong(index) {
      const elevatorServ = this.get('elevatorService');
      elevatorServ.startRide(index, this.get('chosenFloor'));
      this.set('chosenFloor', null);
    }
  }
});
