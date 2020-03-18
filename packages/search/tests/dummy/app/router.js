import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { reportRoutes } from 'navi-reports/router';
import { dashboardRoutes } from 'navi-dashboards/router';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  reportRoutes(this);
  dashboardRoutes(this);
});
