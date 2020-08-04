import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
    await Promise.all([
      this.user.findOrRegister(),
      this.bardMetadata.loadMetadata(),
      this.bardMetadata.loadMetadata({ dataSourceName: 'bardTwo' })
    ]);
  }
}
