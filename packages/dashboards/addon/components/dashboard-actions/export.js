/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *    <DashboardActions::Export
 *      @dashboard={{@dashboard}}
 *      @title={{@dashboard.title}}
 *      @disabled={{not @dashboard.validations.isTruelyValid}}
 *    >
 *      Inner template
 *    </DashboardActions::Export>
 */

import { computed } from '@ember/object';
import MultipleFormatExport from 'navi-reports/components/report-actions/multiple-format-export';

export default class DashboardMultipleFormatExport extends MultipleFormatExport {
  /**
   * @property {String} filename - filename for the downloaded file
   * @override
   */
  @computed('dashboard.title')
  get filename() {
    return `${this.dashboard.title}-dashboard`;
  }

  /**
   * @property {undefined} csvHref - CSV export is not available for dashboards
   * @override
   */
  csvHref = undefined;

  /**
   * @property {Promise} exportHref - Promise resolving to export to file link
   * @override
   */
  @computed('dashboard.id')
  get exportHref() {
    return Promise.resolve(`/export?dashboard=${this.dashboard.id}`);
  }

  /**
   * @property {String} gsheetExportHref - Href for google sheet export
   * @override
   */
  @computed('dashboard.id')
  get gsheetExportHref() {
    return `/gsheet-export/dashboard/${this.dashboard.id}`;
  }

  /**
   * @property {Array} exportFormats - A list of export formats
   * @override
   */
  @computed('exportHref')
  get exportFormats() {
    return super.exportFormats.filter(format => format.type !== 'CSV');
  }
}
