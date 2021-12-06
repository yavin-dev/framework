/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *    <DashboardActions::Export
 *      @model={{@dashboard}}
 *      @disabled={{not @dashboard.validations.isTruelyValid}}
 *    >
 *      Inner template
 *    </DashboardActions::Export>
 */

import MultipleFormatExport from 'navi-reports/components/report-actions/multiple-format-export';

export default class DashboardMultipleFormatExport extends MultipleFormatExport {
  /**
   * filename for the downloaded file
   * @override
   */
  get filename() {
    return `${this.args.model.title}-dashboard`;
  }

  /**
   * Promise resolving to export to file link
   * @override
   */
  get exportHref() {
    return Promise.resolve(`/export?dashboard=${this.args.model.id}`);
  }

  /**
   * Href for google sheet export
   * @override
   */
  get gsheetExportHref() {
    return Promise.resolve(`/gsheet-export/dashboard/${this.args.model.id}`);
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
    return this.args.model.validations.isTruelyValid;
  }
}
