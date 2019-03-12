/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#report-actions/export
 *      report=report
 *   }}
 *      Inner template
 *   {{/report-actions/export}}
 */

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from '../../templates/components/report-actions/export';

export default Component.extend({
  layout,

  /**
   * @property {DS.Model} report
   */
  report: undefined,

  /**
   * @property {Array} classNames
   */
  classNames: ['report-control', 'export-action'],

  /**
   * @property {String} tagName - component DOM tag
   */
  tagName: 'a',

  /**
   * @property {Array} attributeBindings - component attribute binding
   */
  attributeBindings: ['target', 'href', 'download'],

  /**
   * @property {Service} facts - instance of bard facts service
   */
  facts: service('bard-facts'),

  /**
   * @property {Boolean} download - Boolean to check if request is valid and set download
   */
  download: computed('disabled', function() {
    // No Download for disabled action
    if (get(this, 'disabled')) {
      return null;
    } else {
      return true;
    }
  }),

  /**
   * @property {Boolean} download - Boolean to check if request is valid and set target
   */
  target: computed('disabled', function() {
    // No target for disabled action
    if (get(this, 'disabled')) {
      return null;
    } else {
      return '_blank';
    }
  }),

  /**
   * @property {String} href - API link for the report
   */
  href: computed('report.{request,request.validations.isTruelyValid}', 'disabled', function() {
    /*
     * Observe 'report.request.validations.isTruelyValid' to recompute with any request change
     * Void the href on a should disabled
     */
    if (get(this, 'disabled')) {
      return 'javascript:void(0);';
    }

    let request = get(this, 'report.request').serialize();
    return get(this, 'facts').getURL(request, { format: 'csv' });
  })
});
