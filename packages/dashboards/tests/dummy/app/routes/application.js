import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  user: service(),

  /**
   * @property {Ember.Service}
   */
  bardMetadata: service(),

  model() {
    return Promise.all([
      this.user.findOrRegister(),
      this.bardMetadata.loadMetadata(),
      this.bardMetadata.loadMetadata({ dataSourceName: 'bardTwo' })
    ]);
  }
});
