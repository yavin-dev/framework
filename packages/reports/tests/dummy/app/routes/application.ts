import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UserModel from 'navi-core/models/user';
import UserService from 'navi-core/services/user';
import NaviMetadataService from 'navi-data/services/navi-metadata';

export default class ApplicationRoute extends Route {
  @service
  private user!: UserService;

  @service
  private naviMetadata!: NaviMetadataService;

  model(): Promise<UserModel> {
    this.naviMetadata.loadMetadata();
    this.naviMetadata.loadMetadata({ dataSourceName: 'bardTwo' });
    return this.user.findOrRegister();
  }
}
