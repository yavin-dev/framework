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
import { inject as service } from '@ember/service';

export default ExportAction.extend({

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @property {String} href - API link for the report
   */
  href: computed('dashboard', 'disabled', function () {
    // Void the href on a should disabled
    if (get(this, 'disabled')) {
      return 'javascript:void(0);';
    }

    return `/export?dashboardId=${get(this, 'dashboard.id')}`;
  }),

  /**
   * @method click
   */
  click() {
    get(this, 'naviNotifications').add({
      message: `The download should begin soon.`,
      type: 'success',
      timeout: 'medium'
    });
  }

});
