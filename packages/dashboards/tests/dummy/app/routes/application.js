import Ember from 'ember';

const { get } = Ember;

export default Ember.Route.extend({
  user: Ember.inject.service(),

  /**
   * @property {Ember.Service}
   */
  bardMetadata: Ember.inject.service(),

  model() {
    return Ember.RSVP.hash({
      user: get(this, 'user').findOrRegister(),
      metadata: get(this, 'bardMetadata').loadMetadata()
    }).then(() => undefined);
  }
});
