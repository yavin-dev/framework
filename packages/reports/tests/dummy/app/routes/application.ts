import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type UserModel from 'navi-core/models/user';
import type UserService from 'navi-core/services/user';
import type NaviMetadataService from 'navi-data/services/navi-metadata';

export default class ApplicationRoute extends Route {
  @service
  private declare user: UserService;

  @service
  private declare naviMetadata: NaviMetadataService;

  async model(): Promise<UserModel> {
    await this.naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
    return await this.user.findOrRegister();
  }
}
