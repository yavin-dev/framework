export default function() {
  this.post('dashboards/:dashboardId/widgets', 'dashboardWidget');

  this.patch('dashboards/:dashboardId/widgets/:id', 'dashboardWidget');

  this.get('dashboards/:id/widgets', ({ dashboardWidgets }, request) => {
    let { id } = request.params;
    return dashboardWidgets.where({ dashboardId: id });
  });

  this.delete('dashboards/:dashboardId/widgets/:id', 'dashboardWidget');
}
