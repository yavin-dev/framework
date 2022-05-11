import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { Status } from 'navi-data/services/data-availability';
import type UserModel from 'navi-core/models/user';
import type UserService from 'navi-core/services/user';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type DataAvailabilityService from 'navi-data/services/data-availability';

export default class ApplicationRoute extends Route {
  @service
  private declare user: UserService;

  @service
  private declare naviMetadata: NaviMetadataService;

  @service
  private declare dataAvailability: DataAvailabilityService;

  async model(): Promise<UserModel> {
    this.dataAvailability.registerDataSourceAvailability('bardOne', () => ({
      status: Status.OK,
      date: moment.utc().startOf('day'),
    }));
    await this.naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
    return await this.user.findOrRegister();
  }
}
