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

  /**
   * @method model
   * @override
   * @returns {Ember.RSVP.Promise}
   */
  async model() {
    await this.user.findOrRegister();
    await Promise.all([
      this.bardMetadata.loadMetadata(),
      this.bardMetadata.loadMetadata({ dataSourceName: 'blockhead' })
    ]);
  }
}
