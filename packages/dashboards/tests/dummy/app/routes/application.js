import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  user: service(),

  /**
   * @property {Ember.Service}
   */
  bardMetadata: service(),

  model() {
    return hash({
      user: get(this, 'user').findOrRegister(),
      metadata: get(this, 'bardMetadata').loadMetadata()
    }).then(() => undefined);
  }
});
