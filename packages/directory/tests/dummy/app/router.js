/* eslint ember/routes-segments-snake-case: "off" */
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { reportRoutes } from 'navi-reports/router';
import { dashboardRoutes } from 'navi-dashboards/router';
import { directoryRoutes } from 'navi-directory/router';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  directoryRoutes(this, function() {
    this.route('other-data');
  });
  reportRoutes(this);
  dashboardRoutes(this);
});

export default Router;
