/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
export function reportRoutes(router) {
  router.route('reports', function() {
    this.route('new');
    this.route('report', { path: '/:report_id' }, function() {
      this.route('clone');
      this.route('save-as');
      this.route('invalid');
      this.route('edit');
      this.route('view');
      this.route('unauthorized');
    });
  });
}

export function reportCollectionRoutes(router) {
  router.route('report-collections', function() {
    this.route('collection', { path: '/:collection_id' });
  });
}

export function reportPrintRoutes(router) {
  router.route('reports-print', { path: '/print' }, function() {
    this.route('reports', function() {
      this.route('new');
      this.route('report', { path: '/:report_id' }, function() {
        this.route('view');
        this.route('invalid');
      });
    });
  });
}
