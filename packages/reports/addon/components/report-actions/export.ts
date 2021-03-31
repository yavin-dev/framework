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
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type NaviFactsService from 'navi-data/services/navi-facts';
import NaviNotificationsService from 'navi-core/addon/services/interfaces/navi-notifications';
import ReportModel from 'navi-core/addon/models/report';
import { RequestV2 } from 'navi-data/addon/adapters/facts/interface';

interface Args {
  disabled: boolean;
  report: ReportModel;
}

export default class ReportActionExport extends Component<Args> {
  /**
   * @property {string} downloadURL
   */
  @tracked downloadURL?: string;
  /**
   * @property {Array} classNames
   */
  classNames = ['report-control', 'export-action'];

  /**
   * @property {Service} facts - instance of navi facts service
   */
  @service('navi-facts') declare facts: NaviFactsService;
  @service naviNotifications!: NaviNotificationsService;
  /**
   * @property {Boolean} download - Boolean to check if request is valid and set download
   */
  get download() {
    console.log('export download ', this);
    // No Download for disabled action
    if (this.args.disabled) {
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
  get target() {
    console.log('export target ', this);
    // No target for disabled action
    if (this.args.disabled) {
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
  @task *href(): TaskGenerator<string> {
    /*
     * Observe 'report.request.validations.isTruelyValid' to recompute with any request change
     * Void the href on a should disabled
     */
    console.log('export href ', this);
    if (this.args.disabled) {
      console.log('href void');
      return 'javascript:void(0);';
    }
    const req = this.args.report.request;
    const serializedRequest = req.serialize() as RequestV2;
    //const request = this.args.report.request.serialize() as RequestV2;
    const result = yield taskFor(this.facts.getDownloadURL)
      .perform(serializedRequest, {
        format: 'csv',
        dataSourceName: serializedRequest.dataSource,
      })
      .then((value) => {
        this.downloadURL = value;
        return value;
      });
    console.log('result', result);
    //this.set('downloadURL', result);
    return result;
  }

  @action
  onSuccess() {
    this.naviNotifications.add({
      title: 'Exporting',
      style: 'info',
    });
  }
}
