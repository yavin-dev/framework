import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('lineChart');
  this.route('barChart');
  this.route('goalGauge');
  this.route('table');
  this.route('metricLabel');
  this.route('pieChart');
});

export default Router;
