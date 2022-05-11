import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { Status } from 'navi-data/services/data-availability';
import type UserModel from 'navi-core/models/user';
import type UserService from 'navi-core/services/user';
import type DataAvailabilityService from 'navi-data/services/data-availability';

export default class ApplicationRoute extends Route {
  @service
  private declare user: UserService;

  @service
  private declare dataAvailability: DataAvailabilityService;

  model(): Promise<UserModel> {
    this.dataAvailability.registerDataSourceAvailability('bardOne', () => ({
      status: Status.DELAYED,
      date: moment.utc().startOf('day'),
    }));
    this.dataAvailability.registerDataSourceAvailability('bardTwo', () => ({
      status: Status.LATE,
      date: moment.utc().subtract(2, 'day').startOf('hour'),
    }));
    return this.user.findOrRegister();
  }
}
