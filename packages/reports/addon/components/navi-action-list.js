/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@ember/component';
import layout from '../templates/components/navi-action-list';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Component.extend({
  layout,

  /**
   * @property {Service} router
   */
  router: service(),

  /**
   * @property {String} tagName
   * @override
   */
  tagName: 'ul',

  actions: {
    /**
     * @action buildReportUrl
     * @param {Object} report - model with id
     * @returns {String} url for given report
     */
    buildReportUrl(report) {
      let reportId = get(report, 'id'),
          baseUrl = document.location.origin,
          reportUrl = get(this, 'router').urlFor('reports.report', reportId);

      return baseUrl + reportUrl;
    }
  }
});
