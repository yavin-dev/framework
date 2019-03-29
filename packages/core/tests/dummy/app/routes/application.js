import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @property {Ember.Service}
   */
  bardMetadata: service(),

  /**
   * @method model
   * @override
   * @returns {Ember.RSVP.Promise}
   */
  model() {
    return this.get('bardMetadata').loadMetadata();
  }
});
