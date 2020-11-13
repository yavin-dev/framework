/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <ReportActions::MultipleFormatExport @report={{report}}>
 *      Inner template
 *   </ReportActions::MultipleFormatExport>
 */

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import layout from '../../templates/components/report-actions/multiple-format-export';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { htmlSafe } from '@ember/template';

@templateLayout(layout)
@tagName('')
export default class MultipleFormatExport extends Component {
  /**
   * @property {Service} facts - instance of navi facts service
   */
  @service('navi-facts') facts;

  /**
   * @property {Service} compression
   */
  @service compression;

  /**
   * @property {Service} store
   */
  @service store;

  /**
   * @property {Service} naviNotifications
   */
  @service naviNotifications;

  /**
   * @property {String} filename - filename for the downloaded file
   */
  @readOnly('report.title') filename;

  /**
   * @property {Array} supportedFileTypes - supported file types for export
   */
  supportedFileTypes = featureFlag('multipleExportFileTypes');

  /**
   * @property {String} csvHref - CSV download link for the report
   */
  @computed('report.{request,validations.isTruelyValid}')
  get csvHref() {
    let request = this.report.request.serialize();
    return this.facts.getURL(request, { format: 'csv', dataSourceName: request.dataSource });
  }

  /**
   * @property {Promise} exportHref - Promise resolving to export to file link
   */
  @computed('report.{request,visualization,validations.isTruelyValid}')
  get exportHref() {
    const { report: model, compression, store } = this;
    const clonedModel = model.toJSON();

    //Create new report model in case dealing with a widget model
    const newModel = store.createRecord('report', {
      title: clonedModel.title,
      request: model.get('request').clone(),
      visualization: store.createFragment(clonedModel.visualization.type, clonedModel.visualization)
    });

    //Model compression requires an id
    newModel.set('id', newModel.tempId);

    return compression.compressModel(newModel).then(serializedModel => `/export?reportModel=${serializedModel}`);
  }

  /**
   * @property {String} gsheetExportHref - href for google sheet exports
   */
  @computed('report.id')
  get gsheetExportHref() {
    return `/gsheet-export/report/${this.report.id}`;
  }

  /**
   * @property {Array} exportFormats - A list of export formats
   */
  @computed('csvHref', 'exportHref', 'supportedFileTypes', 'gsheetExportHref')
  get exportFormats() {
    const { supportedFileTypes } = this;

    const exportFormats = [
      {
        type: 'CSV',
        href: this.csvHref,
        icon: 'file-text-o',
        async: false,
        requiresSaved: false
      }
    ];

    if (Array.isArray(supportedFileTypes)) {
      if (supportedFileTypes.includes('pdf') || supportedFileTypes.includes('PDF')) {
        exportFormats.push({
          type: 'PDF',
          href: this.exportHref,
          icon: 'file-pdf-o',
          async: false,
          requiresSaved: false
        });
      }

      if (supportedFileTypes.includes('png') || supportedFileTypes.includes('PNG')) {
        exportFormats.push({
          type: 'PNG',
          href: this.exportHref.then(href => `${href}&fileType=png`),
          icon: 'file-image-o',
          async: false,
          requiresSaved: false
        });
      }

      if (supportedFileTypes.includes('gsheet') || supportedFileTypes.includes('GSHEET')) {
        exportFormats.push({
          type: 'Google Sheet',
          href: this.gsheetExportHref,
          icon: 'google',
          async: true,
          requiresSaved: true
        });
      }
    }

    return exportFormats;
  }

  /**
   * @action open
   * A hack to make the trigger responding to click
   */
  @action
  open() {
    return true;
  }

  /**
   * @action close
   */
  @action
  close(dropdown) {
    dropdown.actions.close();
  }

  /**
   * Lets the user know to wait for the export download
   * @action notify
   * @param {String} type - user readable name for the selected export option
   */
  @action
  notify(type) {
    const typeMessages = {
      'Google Sheet': 'We are building your spreadsheet and sending to Google Drive.  Keep an eye out for the email!'
    };
    this.naviNotifications.add({
      message: typeMessages[type] ?? `${type}? Got it. The download should begin soon.`,
      type: 'info',
      timeout: 'medium'
    });
  }

  @action
  async handleAsync(isAsync, event) {
    if (isAsync) {
      const href = event.target.href;
      event.preventDefault();
      try {
        const response = await fetch(href);
        const json = await response.json();
        this.naviNotifications.clearMessages();
        this.naviNotifications.add({
          message: json.url
            ? htmlSafe(`Your export is done and available at <a href="${json.url}" target="_blank">here &raquo;</a>`)
            : 'Your export has finished!',
          type: 'info',
          timeout: 'long'
        });
      } catch (e) {
        console.error(e);
        this.naviNotifications.clearMessages();
        this.naviNotifications.add({
          message: e.message,
          type: 'danger',
          timeout: 'medium'
        });
      }
    }
  }
}
