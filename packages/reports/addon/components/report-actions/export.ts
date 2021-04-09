/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
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
   * @property {string} exportURL
   */
  @tracked exportURL!: string;
  /**
   * @property {Array} classNames
   */
  classNames = ['report-control', 'export-action'];

  /**
   * @property {Service} facts - instance of navi facts service
   */
  @service('navi-facts') declare facts: NaviFactsService;

  /**
   * @property {Service} naviNotifications - instance of navi notifications service
   */
  @service naviNotifications!: NaviNotificationsService;

  /**
   * @property {Boolean} download - Boolean to check if request is valid and set download
   */
  get download() {
    // No Download for disabled action
    if (this.args.disabled) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * @property {Boolean} target - Boolean to check if request is valid and set target
   */
  get target() {
    // No target for disabled action
    if (this.args.disabled) {
      return null;
    } else {
      return '_blank';
    }
  }

  /**
   * Gets the table export url from facts service
   */
  @task *getDownloadURLTask(): TaskGenerator<string> {
    /*
     * Observe 'report.request.validations.isTruelyValid' to recompute with any request change
     * Void the href on a should disabled
     */
    if (this.args.disabled) {
      return 'javascript:void(0);';
    }
    const serializedRequest = this.args.report.request.serialize() as RequestV2;
    const taskResultURL = yield taskFor(this.facts.getDownloadURL)
      .perform(serializedRequest, {
        format: 'csv',
        dataSourceName: serializedRequest.dataSource,
      })
      .then((value) => {
        this.exportURL = value;
      });
    return taskResultURL;
  }

  @action
  showExportNotification() {
    this.naviNotifications.add({
      title: 'Exporting',
      style: 'info',
    });
  }

  @action
  downloadURLLink() {
    let anchorElement = document.createElement('a');
    anchorElement.setAttribute('href', this.exportURL);
    anchorElement.setAttribute('download', this.download.toString());
    anchorElement.setAttribute('target', this.target !== null ? this.target : '');
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
  }
}
