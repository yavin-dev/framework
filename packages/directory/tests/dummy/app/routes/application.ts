import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class Application extends Route {
  /**
   * @property {Ember.Service}
   */
  @service user: TODO;

  /**
   * @property {Ember.Service}
   */
  @service bardMetadata: TODO;

  async model() {
    await Promise.all([this.user.findOrRegister(), this.bardMetadata.loadMetadata()]);
  }

  /**
   * @method afterModel
   * @override
   */
  afterModel() {
    this.transitionTo('directory.my-data');
  }
}
