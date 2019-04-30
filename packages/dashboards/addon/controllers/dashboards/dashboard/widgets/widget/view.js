/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportViewController from 'navi-reports/controllers/reports/report/view';
import { inject as controller } from '@ember/controller';

export default ReportViewController.extend({
  /*
   * @property {Controller} reportController
   */
  reportController: controller('dashboards.dashboard.widgets.widget')
});
