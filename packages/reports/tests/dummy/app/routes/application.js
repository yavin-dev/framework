import Route from '@ember/routing/route';
import { inject } from '@ember/service';

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
  async model() {
    await this.user.findOrRegister();
    await Promise.all([
      this.bardMetadata.loadMetadata(),
      this.bardMetadata.loadMetadata({ dataSourceName: 'bardTwo' })
    ]);
  }
});
