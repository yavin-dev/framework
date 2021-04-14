/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
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
  @task *getDownloadURLTask() {
    const serializedRequest = this.args.report.request.serialize() as RequestV2;
    this.showExportNotification();
    try {
      const url: string = yield taskFor(this.facts.getDownloadURL).perform(serializedRequest, {});
      this.downloadURLLink(url);
    } catch (error) {
      this.naviNotifications.clear();
      this.showErrorNotification(error.message);
    }
  }

  @action
  showExportNotification(): void {
    this.naviNotifications.add({
      title: `The CSV download should begin shortly`,
      style: 'info',
    });
  }

  @action
  showErrorNotification(error: string): void {
    this.naviNotifications.add({
      title: error,
      style: 'danger',
    });
  }

  @action
  downloadURLLink(url?: string): void {
    if (url !== undefined) {
      const anchorElement = document.createElement('a');
      anchorElement.setAttribute('href', url);
      anchorElement.setAttribute('download', this.args.report.title);
      anchorElement.setAttribute('target', '_blank');
      document.body.appendChild(anchorElement);
      anchorElement.click();
      document.body.removeChild(anchorElement);
    }
  }
}
