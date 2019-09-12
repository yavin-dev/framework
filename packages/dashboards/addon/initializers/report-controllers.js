/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This initializer adds the report-to-widget logic to navi-reports controllers
 */
import ReportToWidget from 'navi-dashboards/mixins/controllers/report-to-widget';
import ReportsNewController from 'navi-reports/controllers/reports/new';
import ReportsReportController from 'navi-reports/controllers/reports/report';

export function initialize(/* application */) {
  ReportsNewController.reopen(ReportToWidget);
  ReportsReportController.reopen(ReportToWidget);
}

export default {
  name: 'report-controllers',
  initialize
};
