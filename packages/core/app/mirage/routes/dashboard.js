import Response from 'ember-cli-mirage/response';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function() {
  this.get('dashboards/:id', ({ dashboards }, request) => {
    let id = request.params.id,
      dashboard = dashboards.find(id);

    if (!dashboard) {
      return new Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    return dashboard;
  });

  this.patch('dashboards/:id', function({ dashboards }, request) {
    let { id } = request.params,
      attrs = this.normalizedRequestAttrs();

    dashboards.find(id).update(attrs);
    return new Response(RESPONSE_CODES.NO_CONTENT);
  });

  this.del('/dashboards/:id', ({ dashboards, users }, request) => {
    let { id } = request.params,
      dashboard = dashboards.find(id),
      user = users.find(dashboard.authorId);

    if (!dashboard) {
      return new Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    // Delete dashboard from user
    user.update({
      dashboards: user.dashboards.filter(id => id.toString() !== dashboard.id)
    });

    dashboard.destroy();
    return new Response(RESPONSE_CODES.NO_CONTENT);
  });

  this.get('/dashboards', ({ dashboards }, request) => {
    let idFilter = request.queryParams['filter[dashboards.id]'];

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      dashboards = dashboards.find(ids);
    } else {
      dashboards = dashboards.all();
    }

    return dashboards;
  });

  this.post('/dashboards', function({ dashboards, users }) {
    let attrs = this.normalizedRequestAttrs(),
      dashboard = dashboards.create(attrs),
      author = users.find(dashboard.authorId);

    // Update user with new dashboard
    author.update(dashboards, author.dashboards.add(dashboard));

    // Init properties
    dashboard.update({
      widgetIds: [],
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
    });

    return dashboard;
  });
}
