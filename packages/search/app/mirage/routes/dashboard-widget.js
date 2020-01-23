export default function() {
  this.post('dashboards/:dashboardId/widgets', 'dashboardWidget');

  this.patch('dashboards/:dashboardId/widgets/:id', 'dashboardWidget');

  this.get('dashboards/:id/widgets', function({ dashboardWidgets }, request) {
    let { id } = request.params;

    return dashboardWidgets.where({ dashboardId: id });
  });

  this.del('dashboards/:dashboardId/widgets/:id', 'dashboardWidget');
}
