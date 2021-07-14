import Response from 'ember-cli-mirage/response';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';
import { filterModel } from 'navi-core/mirage/utils/rsql-utils';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function () {
  this.get('dashboards/:id', ({ dashboards }, request) => {
    const { id } = request.params;
    const dashboard = dashboards.find(id);

    if (!dashboard) {
      return new Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    return dashboard;
  });

  this.patch('dashboards/:id', function ({ dashboards }, request) {
    const { id } = request.params;
    const attrs = this.normalizedRequestAttrs();

    dashboards.find(id).update(attrs);
    return new Response(RESPONSE_CODES.NO_CONTENT);
  });

  this.del('/dashboards/:id', ({ dashboards, users }, request) => {
    const { id } = request.params;
    const dashboard = dashboards.find(id);
    const user = users.find(dashboard.ownerId);

    if (!dashboard) {
      return new Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    // Delete dashboard from user
    user.update({
      dashboards: user.dashboards.filter((id) => id.toString() !== dashboard.id),
    });

    dashboard.destroy();
    return new Response(RESPONSE_CODES.NO_CONTENT);
  });

  this.get('/dashboards', ({ dashboards }, request) => {
    const { filter } = request.queryParams;
    const queryFilter = request.queryParams['filter[dashboards]'];

    // Allow filtering
    if (filter) {
      const ids = filter.split('id=in=')[1].replace('(', '').replace(')', '').split(',');
      return dashboards.find(ids);
    } else if (queryFilter) {
      return filterModel(dashboards, queryFilter);
    } else {
      return dashboards.all();
    }
  });

  this.post('/dashboards', function ({ dashboards, users }) {
    const attrs = this.normalizedRequestAttrs();
    const dashboard = dashboards.create(attrs);
    const owner = users.find(dashboard.ownerId);

    // Update user with new dashboard
    owner.update(dashboards, owner.dashboards.add(dashboard));

    // Init properties
    dashboard.update({
      widgetIds: [],
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT),
    });

    return dashboard;
  });
}
