import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { Status } from 'navi-data/services/data-availability';
import moment from 'moment';
import type DataAvailabilityService from 'navi-data/services/data-availability';

export default class ApplicationRoute extends Route {
  @service
  private declare naviMetadata: NaviMetadataService;

  @service
  private declare dataAvailability: DataAvailabilityService;

  constructor() {
    super(...arguments);
    this.dataAvailability.registerDataSourceAvailability('bardOne', () => {
      return { status: Status.DELAYED, date: moment.utc().startOf('day').subtract(1, 'day') };
    });
  }

  model() {
    return this.naviMetadata.loadMetadata();
  }
}
