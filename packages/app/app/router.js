/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('landing', {path:'/'});

  this.route('dashboard-collections', function() {
    this.route('collection', {path:'/:collection_id'});
  });

  this.route('dashboards', function() {
    this.route('new');
    this.route('dashboard', { path: '/:dashboard_id' }, function() {
      this.route('clone');
      this.route('view');

      this.route('widgets', function() {
        this.route('add');
        this.route('new');
        this.route('widget', { path: '/:widget_id'}, function() {
          this.route('new');
          this.route('invalid');
          this.route('view');
          this.route('clone-to-report');
        });
      });
    });
  });

  this.route('reports', function() {
    this.route('new');
    this.route('report', { path: '/:report_id'}, function() {
      this.route('new');
      this.route('invalid');
      this.route('view');
      this.route('clone');
      this.route('save-as');
    });
  });

  this.route('beta', function() {
    this.route('reports', function() {
      this.route('report', { path: '/:report_id' }, function() {
        this.route('view');
      });
    });
  });
});

export default Router;
