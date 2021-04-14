/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
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
  exportURL!: string;
  /**
   * @property {Service} facts - instance of navi facts service
   */
  @service('navi-facts') declare facts: NaviFactsService;

  /**
   * @property {Service} naviNotifications - instance of navi notifications service
   */
  @service naviNotifications!: NaviNotificationsService;

  /**
   * Gets the table export url from facts service
   */
  @task *getDownloadURLTask(): TaskGenerator<string> {
    /*
     * Observe 'report.request.validations.isTruelyValid' to recompute with any request change
     * Void the href on a should disabled
     */
    const serializedRequest = this.args.report.request.serialize() as RequestV2;
    try {
      return yield taskFor(this.facts.getDownloadURL)
        .perform(serializedRequest, {})
        .then((value) => {
          this.exportURL = value;
        });
    } catch (error) {
      this.naviNotifications.clear();
      this.showErrorNotification(error.message);
      return 'javascript:void(0);';
    }
  }

  @action
  showExportNotification() {
    this.naviNotifications.add({
      title: `The CSV download should begin shortly`,
      style: 'info',
    });
  }

  @action
  showErrorNotification(error: string) {
    this.naviNotifications.add({
      title: error,
      style: 'danger',
    });
  }

  @action
  downloadURLLink() {
    let anchorElement = document.createElement('a');
    anchorElement.setAttribute('href', this.exportURL);
    anchorElement.setAttribute('download', this.args.report.title);
    anchorElement.setAttribute('target', '_blank');
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
  }
}
