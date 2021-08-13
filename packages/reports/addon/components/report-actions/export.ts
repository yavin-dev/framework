/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { TaskGenerator, task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type ReportModel from 'navi-core/models/report';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import Ember from 'ember';

interface Args {
  report: ReportModel;
}

export default class ReportActionExport extends Component<Args> {
  /**
   * instance of navi facts service
   */
  @service('navi-facts') declare facts: NaviFactsService;

  /**
   * instance of navi notifications service
   */
  @service naviNotifications!: NaviNotificationsService;

  /**
   * export format
   */
  exportType = 'CSV';

  /**
   * filename for the downloaded file
   */
  get filename() {
    return this.args.report.title;
  }

  /**
   * Determines whether the report is valid for exporting
   */
  async isValidForExport(): Promise<boolean> {
    const { report } = this.args;
    await report.request?.loadMetadata();
    return report.validations.isTruelyValid;
  }

  @task *downloadTask(): TaskGenerator<void> {
    const serializedRequest = this.args.report.request.serialize() as RequestV2;

    try {
      const url: string = yield taskFor(this.facts.getDownloadURL).perform(serializedRequest, {});
      this.downloadURLLink(url);
    } catch (e) {
      console.error(e);
      this.showErrorNotification(e?.message);
    }
  }

  /**
   * Gets the table export url from facts service
   */
  @task *exportTask(): TaskGenerator<void> {
    this.showExportNotification();

    const isValid: boolean = yield this.isValidForExport();

    if (!isValid) {
      this.showErrorNotification('Please run a valid report and try again.');
    } else {
      yield taskFor(this.downloadTask).perform();
    }
  }

  showExportNotification(): void {
    const { naviNotifications, exportType } = this;

    naviNotifications.clear();
    naviNotifications.add({
      title: `Your ${exportType} download should begin shortly`,
      style: 'info',
    });
  }

  showErrorNotification(message?: string): void {
    const { naviNotifications } = this;

    naviNotifications.clear();
    naviNotifications.add({
      title: message ?? `An error occurred while exporting.`,
      style: 'danger',
    });
  }

  async downloadURLLink(url?: string | undefined) {
    if (url !== undefined) {
      const anchorElement = document.createElement('a');
      anchorElement.setAttribute('class', 'export__download-link');
      anchorElement.setAttribute('href', url);
      anchorElement.setAttribute('download', this.filename);
      anchorElement.setAttribute('target', '_blank');
      document.querySelector('#export__download-url')?.appendChild(anchorElement);
      anchorElement.click();
      if (Ember.testing) {
        await this.delay(5000);
      }
      document.querySelector('#export__download-url')?.removeChild(anchorElement);
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
