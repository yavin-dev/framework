import Ember from 'ember';

export default Ember.Route.extend({
  /**
   * @property {Ember.Service}
   */
  bardMetadata: Ember.inject.service(),

  /**
   * @method model
   * @override
   * @returns {Ember.RSVP.Promise}
   */
  model() {
    return this.get('bardMetadata').loadMetadata();
  }
});
