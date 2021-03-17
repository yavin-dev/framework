/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';

export default class ReportsReportSaveAsController extends Controller {
  /**
   * Title of the new report name passed to the save as route
   */
  queryParams = ['title'];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'reports.report.save-as': ReportsReportSaveAsController;
  }
}
