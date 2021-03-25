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
import { get, computed, action } from '@ember/object';
import layout from '../../templates/components/report-actions/export';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { serializeParameters } from 'navi-data/addon/utils/metric';
@templateLayout(layout)
@tagName('')
class Export extends Component {
  /**
   * @property {DS.Model} report
   */
  report = undefined;

  /**
   * @property {Array} classNames
   */
  classNames = ['report-control', 'export-action'];

  /**
   * @property {Service} facts - instance of navi facts service
   */
  @service('navi-facts') facts;
  @service('naviNotifications') naviNotifications;
  /**
   * @property {Boolean} download - Boolean to check if request is valid and set download
   */
  @computed('disabled')
  get download() {
    console.log('export download ', this);
    // No Download for disabled action
    if (get(this, 'disabled')) {
      console.log('download null');
      return null;
    } else {
      console.log('download true');
      return true;
    }
  }

  /**
   * @property {Boolean} target - Boolean to check if request is valid and set target
   */
  @computed('disabled')
  get target() {
    console.log('export target ', this);
    // No target for disabled action
    if (get(this, 'disabled')) {
      console.log('target null');
      return null;
    } else {
      console.log('target _blank');
      return '_blank';
    }
  }

  /**
   * @property {String} href - API link for the report
   */
  @computed('disabled', 'facts', 'report.request.validations.isTruelyValid')
  get href() {
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
    const url = this.facts.getDownloadURL(request, { format: 'csv', dataSourceName: request.dataSource });
    console.log(' getDownloadURL ', url);
    return url;
  }

  @action
  onSuccess() {
    this.naviNotifications.add({
      title: 'Exporting',
      style: 'info',
    });
  }
}
export default Export;
