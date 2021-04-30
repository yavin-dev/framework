import Route from '@ember/routing/route';

export default class DirectoryMyDataRoute extends Route {
  beforeModel() {
    this.transitionTo('dashboards');
  }
}
