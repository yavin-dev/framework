import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  user: inject(),

  /**
   * @property {Ember.Service}
   */
  bardMetadata: inject(),

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
