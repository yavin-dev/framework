/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportNewRoute from 'navi-reports/routes/reports/new';
import type ReportModel from 'navi-core/models/report';

export default class ReportsPrintReportsNewRoute extends ReportNewRoute {
  /**
   * @param report - resolved report model
   * @override
   */
  afterModel(report: ReportModel) {
    return this.replaceWith('reports-print.reports.report.view', report.tempId);
  }
}
