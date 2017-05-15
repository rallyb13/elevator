import Ember from 'ember';

export default Ember.Component.extend({
  // Services
  elevatorService: Ember.inject.service('elevator-control'),

  // Properties
  activeFloor: 1
});
