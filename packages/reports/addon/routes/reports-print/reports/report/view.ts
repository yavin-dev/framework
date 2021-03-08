/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportsReportViewRoute from '../../../reports/report/view';
import type { ModelFrom } from 'navi-core/utils/type-utils';
import type ReportsPrintReportsReportRoute from '../report';

export default class PrintReportsReportViewRoute extends ReportsReportViewRoute {
  /**
   * @property parentModel - object containing request to view
   */
  get parentModel(): ModelFrom<ReportsPrintReportsReportRoute> {
    return this.modelFor('reports-print.reports.report');
  }
}
