/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *    <DashboardActions::Export
 *      @dashboard={{@dashboard}}
 *    >
 *      Inner template
 *    </DashboardActions::Export>
 */

import MultipleFormatExport from 'navi-reports/components/report-actions/multiple-format-export';
import { task } from 'ember-concurrency';

export default class DashboardMultipleFormatExport extends MultipleFormatExport {
  /**
   * @override
   */
  get filename() {
    return `${this.args.dashboard.title}-dashboard`;
  }

  /**
   * @override
   */
  get exportHref() {
    return `/export?dashboard=${this.args.dashboard.id}`;
  }

  /**
   * Href for google sheet export
   * @override
   */
  get gsheetExportHref() {
    return `/gsheet-export/dashboard/${this.args.dashboard.id}`;
  }

  /**
   * A list of export formats
   * @override
   */
  get exportFormats() {
    return super.exportFormats.filter((format) => format.type !== 'CSV');
  }

  /**
   * Determines whether the dashboard is valid for exporting
   * @override
   */
  isValidForExport() {
    return this.args.dashboard.validations.isTruelyValid;
  }
}
