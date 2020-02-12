/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { reportRoutes, reportCollectionRoutes, reportPrintRoutes } from 'navi-reports/router';
import { dashboardRoutes, dashboardCollectionRoutes, dashboardPrintRoutes } from 'navi-dashboards/router';
import { directoryRoutes } from 'navi-directory/router';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('landing', { path: '/' });
  directoryRoutes(this);
  reportRoutes(this);
  reportCollectionRoutes(this);
  reportPrintRoutes(this);
  dashboardRoutes(this);
  dashboardCollectionRoutes(this);
  dashboardPrintRoutes(this);
});
