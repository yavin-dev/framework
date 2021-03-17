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
   * @property {Service} facts - instance of navi facts service
   */
  facts: service('navi-facts'),

  /**
   * @property {Boolean} download - Boolean to check if request is valid and set download
   */
  download: computed('disabled', function () {
    console.log('export download ', this);
    // No Download for disabled action
    if (get(this, 'disabled')) {
      console.log('download null');
      return null;
    } else {
      console.log('download true');
      return true;
    }
  }),

  /**
   * @property {Boolean} download - Boolean to check if request is valid and set target
   */
  target: computed('disabled', function () {
    console.log('export target ', this);
    // No target for disabled action
    if (get(this, 'disabled')) {
      console.log('target null');
      return null;
    } else {
      console.log('target _blank');
      return '_blank';
    }
  }),

  /**
   * @property {String} href - API link for the report
   */
  href: computed('report.{request,request.validations.isTruelyValid}', 'disabled', function () {
    /*
     * Observe 'report.request.validations.isTruelyValid' to recompute with any request change
     * Void the href on a should disabled
     */
    console.log('export href ', this);
    if (get(this, 'disabled')) {
      console.log('href void');
      return 'javascript:void(0);';
    }

    let request = get(this, 'report.request').serialize();
    console.log(
      ' getDownloadURL ',
      this.facts.getDownloadURL(request, { format: 'csv', dataSourceName: request.dataSource })
    );
    console.log(' getURL ', this.facts.getURL(request, { format: 'csv', dataSourceName: request.dataSource }));
    // eslint-disable-next-line prettier/prettier
    return  this.facts.getDownloadURL(request, { format: 'csv', dataSourceName: request.dataSource });
  }),
});
