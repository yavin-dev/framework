/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <ReportActions::MultipleFormatExport
 *      @model={{@report}}
 *      @disabled={{not @report.validations.isTruelyValid}}
 *   >
 *      Inner template
 *   </ReportActions::MultipleFormatExport>
 */

import { inject as service } from '@ember/service';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import ReportActionExport from 'navi-reports/components/report-actions/export';
import type StoreService from '@ember-data/store';
import type CompressionService from 'navi-core/services/compression';
import { TaskGenerator, task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type ReportModel from 'navi-core/models/report';

export default class MultipleFormatExport extends ReportActionExport {
  /**
   * instance of compression service
   */
  @service declare compression: CompressionService;

  /**
   * instance of store service
   */
  @service declare store: StoreService;

  /**
   * Promise resolving to export to file link
   */
  get exportHref() {
    const {
      args: { model },
      compression,
      store,
    } = this;

    const serializedModel = model.toJSON() as ReportModel;

    // Create new report model in case we're dealing with a widget model
    const newModel = store.createRecord('report', {
      title: serializedModel.title,
      request: model.request.clone(),
      visualization: store.createFragment(serializedModel.visualization.type, serializedModel.visualization),
    });

    // Model compression requires an id
    newModel.set('id', newModel.tempId);

    return compression.compressModel(newModel).then((compressedModel) => `/export?reportModel=${compressedModel}`);
  }

  /**
   * Href for google sheet export
   */
  get gsheetExportHref() {
    return `/gsheet-export/report/${this.args.model.id}`;
  }

  /**
   * A list of export formats
   */
  get exportFormats(): Array<{ type: string; icon: string; requiresSaved: boolean }> {
    const supportedFileTypes = featureFlag('exportFileTypes');
    const exportFormats = [];

    if (Array.isArray(supportedFileTypes)) {
      if (supportedFileTypes.includes('csv') || supportedFileTypes.includes('CSV')) {
        exportFormats.push({
          type: 'CSV',
          icon: 'table',
          requiresSaved: false,
        });
      }

      if (supportedFileTypes.includes('pdf') || supportedFileTypes.includes('PDF')) {
        exportFormats.push({
          type: 'PDF',
          icon: 'file-text',
          requiresSaved: false,
        });
      }

      if (supportedFileTypes.includes('png') || supportedFileTypes.includes('PNG')) {
        exportFormats.push({
          type: 'PNG',
          icon: 'photo',
          requiresSaved: false,
        });
      }

      if (supportedFileTypes.includes('gsheet') || supportedFileTypes.includes('GSHEET')) {
        exportFormats.push({
          type: 'Google Sheet',
          icon: 'google',
          requiresSaved: true,
        });
      }
    }

    return exportFormats;
  }

  /**
   * @override
   */
  @task *downloadTask(): TaskGenerator<void> {
    const { exportType } = this;

    try {
      if (exportType === 'CSV') {
        yield taskFor(super.downloadTask).perform();
      } else if (exportType === 'PDF' || exportType === 'PNG') {
        let url: string = yield this.exportHref;
        if (exportType === 'PNG') {
          url += '&fileType=png';
        }
        this.downloadURLLink(url);
      } else if (exportType === 'Google Sheet') {
        yield taskFor(this.gSheetExportTask).perform();
      } else {
        this.showErrorNotification(`${exportType} export is not supported.`);
      }
    } catch (e) {
      this.showErrorNotification(e?.message);
    }
  }

  /**
   * @override
   */
  showExportNotification(): void {
    const { naviNotifications, exportType } = this;
    const typeTitles: { [key: string]: string } = {
      'Google Sheet': 'We are building your spreadsheet and sending it to Google Drive. Keep an eye out for the email!',
    };
    const title = typeTitles[exportType];

    if (title) {
      naviNotifications.clear();
      naviNotifications.add({
        title,
        style: 'info',
        timeout: 'medium',
      });
    } else {
      super.showExportNotification();
    }
  }

  @task *gSheetExportTask(): TaskGenerator<void> {
    const { naviNotifications } = this;

    const response = yield fetch(this.gsheetExportHref);
    const json = yield response.json();

    naviNotifications?.clear();
    naviNotifications?.add({
      title: json.url ? `Your export is done and available at ${json.url}` : 'Your export has finished!',
      style: 'info',
      timeout: 'long',
    });
  }
}
