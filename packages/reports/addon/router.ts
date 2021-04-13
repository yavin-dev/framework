/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import type RouterDSL from '@ember/routing/-private/router-dsl';

export function reportRoutes(router: RouterDSL) {
  router.route('reports', function () {
    this.route('new');
    this.route('report', { path: '/:report_id' }, function () {
      this.route('clone');
      this.route('save-as');
      this.route('invalid');
      this.route('edit');
      this.route('view');
      this.route('unauthorized');
    });
  });
}

export function reportCollectionRoutes(router: RouterDSL) {
  router.route('report-collections', function () {
    this.route('collection', { path: '/:collection_id' });
  });
}

export function reportPrintRoutes(router: RouterDSL) {
  router.route('reports-print.reports', { path: '/print/reports' }, function () {
    this.route('new');
    this.route('report', { path: '/:report_id' }, function () {
      this.route('view');
      this.route('invalid');
    });
  });
}
