/* eslint ember/routes-segments-snake-case: "off" */
import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('directory', function() {
    this.route('my-directory');
  });

  this.route('reports', function() {
    this.route('new');
    this.route('report', { path: '/:reportId'}, function() {
      this.route('new');
    });
  });

  this.route('dashboards', function() {
    this.route('new');
    this.route('dashboard', { path: '/:dashboardId'}, function() {
      this.route('view');
      this.route('clone');
    });
  });
});

export default Router;
