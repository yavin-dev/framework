import Ember from 'ember';
import { inject } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Ember.Route.extend({
  user: inject(),

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
    return hash({
      user: get(this, 'user').findOrRegister(),
      metadata: get(this, 'bardMetadata').loadMetadata()
    }).then(() => undefined);
  }
});
