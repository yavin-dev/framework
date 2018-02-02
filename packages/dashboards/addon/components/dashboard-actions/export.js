/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#dashboard-actions/export
 *      dashboard=dashboard
 *   }}
 *      Inner template
 *   {{/dashboard-actions/export}}
 */

import { computed, get } from '@ember/object';
import ExportAction from 'navi-reports/components/report-actions/export';

export default ExportAction.extend({
  /**
   * @property {String} href - API link for the report
   */
  href: computed('dashboard', 'disabled', function () {
    // Void the href on a should disabled
    if (get(this, 'disabled')) {
      return 'javascript:void(0);';
    }

    return `/export?dashboardId=${get(this, 'dashboard.id')}`;
  })
});
