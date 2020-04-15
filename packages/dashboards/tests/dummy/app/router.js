import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { reportRoutes } from 'navi-reports/router';
import { dashboardRoutes, dashboardCollectionRoutes, dashboardPrintRoutes } from 'navi-dashboards/router';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  //mock directoy route
  this.route('directory', function() {
    this.route('my-data');
  });
  reportRoutes(this);
  dashboardRoutes(this);
  dashboardCollectionRoutes(this);
  dashboardPrintRoutes(this);
});
