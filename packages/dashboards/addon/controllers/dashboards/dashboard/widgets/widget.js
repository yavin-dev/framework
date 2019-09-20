/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportController from 'navi-reports/controllers/reports/report';
import { computed } from '@ember/object';
import { inject as controller } from '@ember/controller';

export default ReportController.extend({
  /**
   * @param {Controller} - dashboard controller
   */
  dashboard: controller('dashboards.dashboard'),
  /**
   * @param {Object} parentQueryParams - Used to store query parameters from the parent route
   */
  parentQueryParams: computed.alias('dashboard.queryCache')
});
