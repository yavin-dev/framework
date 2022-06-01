/* eslint-disable ember/no-shadow-route-definition */
/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import type RouterDSL from '@ember/routing/-private/router-dsl';

export function dashboardRoutes(router: RouterDSL) {
  router.route('dashboards', function () {
    this.route('new');

    this.route('dashboard', { path: '/:dashboard_id' }, function () {
      this.route('clone');
      this.route('view');

      this.route('widgets', function () {
        this.route('add');
        this.route('new');
        this.route('widget', { path: '/:widget_id' }, function () {
          this.route('clone');
          this.route('clone-to-report');
          this.route('edit');
          this.route('view');
          this.route('invalid');
        });
      });
    });
  });
}

export function dashboardCollectionRoutes(router: RouterDSL) {
  router.route('dashboard-collections', function () {
    this.route('collection', { path: '/:collection_id' });
  });
}

export function dashboardPrintRoutes(router: RouterDSL) {
  router.route('dashboards-print.dashboards', { path: '/print/dashboards' }, function () {
    this.route('dashboard', { path: '/:dashboard_id' }, function () {
      this.route('view');
    });
  });
}
