/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This initializer adds the report-to-widget logic to navi-reports routes
 */
import ReportToWidget from 'navi-dashboards/mixins/routes/report-to-widget';
import ReportsNewRoute from 'navi-reports/routes/reports/new';
import ReportsReportRoute from 'navi-reports/routes/reports/report';

export function initialize(/* application */) {
  ReportsNewRoute.reopen(ReportToWidget);
  ReportsReportRoute.reopen(ReportToWidget);
}

export default {
  name: 'report-routes',
  initialize
};
