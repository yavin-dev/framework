import Route from '@ember/routing/route';

export default class DashboardsIndexRoute extends Route {
  /**
   * @method redirect
   * @overrride
   */
  redirect() {
    this.transitionTo('dashboards');
  }
}
