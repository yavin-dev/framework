import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UserService from 'navi-core/services/user';
import NaviMetadataService from 'navi-data/services/navi-metadata';

export default class ApplicationRoute extends Route {
  @service
  private user!: UserService;

  @service
  private naviMetadata!: NaviMetadataService;

  model() {
    return Promise.all([
      this.user.findOrRegister(),
      this.naviMetadata.loadMetadata(),
      this.naviMetadata.loadMetadata({ dataSourceName: 'bardTwo' }),
    ]);
  }
}
