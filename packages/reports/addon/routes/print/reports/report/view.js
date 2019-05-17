/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed } from '@ember/object';
import ReportViewRoute from 'navi-reports/routes/reports/report/view';

export default ReportViewRoute.extend({
  /**
   * @property {Object} parentModel - object containing request to view
   */
  parentModel: computed(function() {
    return this.modelFor('print.reports.report');
  }).volatile()
});
