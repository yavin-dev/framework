import moment from 'moment';
import Mirage from 'ember-cli-mirage';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const assignWidgets = (dashboard, widgets) => {
  dashboard.associationKeys.push('widgets');
  dashboard.widgets = widgets.where({dashboardId: dashboard.id});
}

const assignDeliveryRules = (dashboard, deliveryRules) => {
  if(deliveryRules) {
    dashboard.associationKeys.push('deliveryRules');
    dashboard.deliveryRules = deliveryRules.where({ deliveredItemId: dashboard.id });
  }
}

export default function() {
  this.get('dashboards/:id', ({ dashboards, dashboardWidgets, deliveryRules }, request) => {
    let id = request.params.id,
        dashboard = dashboards.find(id);

    assignWidgets(dashboard, dashboardWidgets);
    assignDeliveryRules(dashboard, deliveryRules)
    return dashboard;
  });

  this.patch('dashboards/:id', function({ dashboards }, request) {
    let { id } = request.params,
        attrs = this.normalizedRequestAttrs();

    dashboards.find(id).update(attrs);
    return new Mirage.Response(204);
  });

  this.del('/dashboards/:id', ({ dashboards, db }, request) => {
    let { id } = request.params,
        dashboard = dashboards.find(id),
        user = db.users.find(dashboard.authorId);

    // Delete dashboard from user
    db.users.update(dashboard.authorId, {
      dashboards: user.dashboards.filter((id) => id.toString() !== dashboard.id)
    });

    dashboard.destroy();
  });

  this.get('/dashboards', ({ dashboards, dashboardWidgets, deliveryRules }, request) => {
    let idFilter = request.queryParams['filter[dashboards.id]'];

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      dashboards = dashboards.find(ids);
    } else {
      dashboards = dashboards.all();
    }

    dashboards.models.forEach(dashboard => assignWidgets(dashboard, dashboardWidgets));
    dashboards.models.forEach(dashboard => assignDeliveryRules(dashboard, deliveryRules));
    return dashboards;
  });

  this.post('/dashboards', function({ dashboards, db }) {
    let attrs = this.normalizedRequestAttrs(),
        dashboard = dashboards.create(attrs);

    // Update user with new dashboard
    db.users.update(dashboard.authorId, {
      dashboards: dashboard.author.dashboards.concat([Number(dashboard.id)])
    });

    // Init properties
    db.dashboards.update(dashboard.id, {
      widgetIds: [],
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
    });

    return dashboard;
  });
}
