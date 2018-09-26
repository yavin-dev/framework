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
import { dasherize } from '@ember/string';
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
  href: computed('dashboard', 'disabled', function() {
    // Void the href on a should disabled
    if (get(this, 'disabled')) {
      return 'javascript:void(0);';
    }

    return `/export?dashboard=${get(this, 'dashboard.id')}`;
  }),

  /**
   * @property {String} download - suggested filename
   */
  download: computed('dashboard', function() {
    return dasherize(get(this, 'dashboard.title')) + '-dashboard';
  }),

  /**
   * @method click
   */
  click() {
    get(this, 'naviNotifications').add({
      message: `The download should begin soon.`,
      type: 'info',
      timeout: 'medium'
    });
  }
});
