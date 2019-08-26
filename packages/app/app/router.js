/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { reportRoutes, reportCollectionRoutes, reportPrintRoutes } from 'navi-reports/router';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('landing', { path: '/' });

  this.route('directory', function() {
    this.route('my-data');
  });

  this.route('dashboard-collections', function() {
    this.route('collection', { path: '/:collection_id' });
  });

  this.route('dashboards', function() {
    this.route('new');
    this.route('dashboard', { path: '/:dashboard_id' }, function() {
      this.route('clone');
      this.route('view');

      this.route('widgets', function() {
        this.route('add');
        this.route('new');
        this.route('widget', { path: '/:widget_id' }, function() {
          this.route('edit');
          this.route('invalid');
          this.route('view');
          this.route('clone-to-report');
        });
      });
    });
  });

  reportRoutes(this);
  reportCollectionRoutes(this);
  reportPrintRoutes(this);

});

export default Router;
