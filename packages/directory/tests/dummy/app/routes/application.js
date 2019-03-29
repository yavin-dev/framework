import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  user: inject(),

  /**
   * @property {Ember.Service}
   */
  bardMetadata: inject(),

  model() {
    return hash({
      user: this.user.findOrRegister(),
      metadata: this.bardMetadata.loadMetadata()
    }).then(() => undefined);
  },

  /**
   * @method afterModel
   * @override
   */
  afterModel() {
    this.transitionTo('directory.my-data');
  }
});
