import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('line-chart');
  this.route('bar-chart');
  this.route('goal-gauge');
  this.route('pie-chart');
});
