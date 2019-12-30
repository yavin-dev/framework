import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class Application extends Route {
  /**
   * @property {Ember.Service}
   */
  @service user;

  /**
   * @property {Ember.Service}
   */
  @service bardMetadata;

  model() {
    return hash({
      user: this.user.findOrRegister(),
      metadata: this.bardMetadata.loadMetadata()
    }).then(() => undefined);
  }

  /**
   * @method afterModel
   * @override
   */
  afterModel() {
    this.transitionTo('directory.my-data');
  }
}
