/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportView from 'navi-reports/routes/reports/report/view';

export default ReportView.extend({
  /**
   * @property {Object} parentModel - object containing request to view
   */
  get parentModel() {
    return this.modelFor('dashboards.dashboard.widgets.widget');
  }
});
