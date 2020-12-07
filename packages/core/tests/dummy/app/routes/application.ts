import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import NaviMetadataService from 'navi-data/services/navi-metadata';

export default class ApplicationRoute extends Route {
  /**
   * @property {Ember.Service}
   */
  @service
  private naviMetadata!: NaviMetadataService;

  /**
   * @method model
   * @override
   * @returns {Ember.RSVP.Promise}
   */
  model() {
    return this.naviMetadata.loadMetadata();
  }
}
