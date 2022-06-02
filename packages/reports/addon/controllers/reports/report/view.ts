/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed } from '@ember/object';
import { isEqual, omit } from 'lodash-es';
import Controller, { inject as controller } from '@ember/controller';
import { canonicalizeColumn } from '@yavin/client/utils/column';
import type { RequestV2 } from '@yavin/client/request';
import type ReportsReportController from '../report';
import type { ModelFrom } from 'navi-core/utils/type-utils';
import type ReportsReportViewRoute from 'navi-reports/routes/reports/report/view';

/**
 * @param request
 * @returns canonicalized metrics sorted alphabetically
 */
function sortedColumns(request: RequestV2) {
  const canonicalNames = request.columns.map((col) => canonicalizeColumn(col));
  return [...new Set(canonicalNames)].sort();
}

export default class ReportsReportViewController extends Controller {
  declare model: ModelFrom<ReportsReportViewRoute>;

  @controller('reports.report') declare reportController: ReportsReportController;

  /**
   * Checks whether the current data has been fetched for the given request
   */
  @computed(
    'reportController.modifiedRequest.{columns.[],filters.[],sorts.[],table,dataSource}',
    'model.request.{columns.[],filters.[],sorts.[],table,dataSource}'
  )
  get hasRequestRun(): boolean {
    const { modifiedRequest } = this.reportController;
    const { request } = this.model || {};

    if (!modifiedRequest || !request) {
      //no changes have been made yet
      return true;
    }

    if (!isEqual(sortedColumns(request), sortedColumns(modifiedRequest))) {
      //changes in metrics outside of order
      return false;
    }

    if (!isEqual(omit(request, 'columns'), omit(modifiedRequest, 'columns'))) {
      //changes in request outside of metrics
      return false;
    }

    //no changes with the exception of order of metrics
    return true;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'reports.report.view': ReportsReportViewController;
  }
}
