import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UserService from 'navi-core/services/user';
import NaviMetadataService from 'navi-data/services/navi-metadata';

export default class Application extends Route {
  @service
  private user!: UserService;

  @service
  private naviMetadata!: NaviMetadataService;

  async model() {
    await Promise.all([this.user.findOrRegister(), this.naviMetadata.loadMetadata()]);
  }

  /**
   * @method afterModel
   * @override
   */
  afterModel() {
    this.transitionTo('directory.my-data');
  }
}
