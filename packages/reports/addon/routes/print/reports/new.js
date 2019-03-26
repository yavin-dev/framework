/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get } from '@ember/object';

import ReportNewRoute from 'navi-reports/routes/reports/new';

export default ReportNewRoute.extend({
  /**
   * @method afterModel
   * @param {DS.Model} report - resolved report model
   * @override
   */
  afterModel(report) {
    return this.replaceWith('print.reports.report.view', get(report, 'tempId'));
  }
});
