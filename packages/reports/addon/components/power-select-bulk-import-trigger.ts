/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * An ember-power-select trigger component that can import a list of comma separated values on paste
 */
import { A } from '@ember/array';
import Trigger from 'ember-power-select/components/power-select-multiple/trigger';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const BULK_IMPORT_DELIMITER = ',';

export default class PowerSelectBulkImportTrigger extends Trigger {
  @tracked
  _showBulkImport = false;

  /**
   * list of ids that were pasted into search input
   */
  @tracked
  _bulkImportQueryIds: string[] = [];

  /**
   * String that was pasted into search input
   */
  @tracked
  _bulkImportRawValue?: string;

  /**
   * @param {Array} values - list of power select options to select
   */
  @action
  importValues(values: string[]) {
    const oldSelection = this.args.select.selected;
    const newSelection = A([...oldSelection, ...values]).uniq();
    this.args.select.actions.select(newSelection);
  }

  /**
   * Grabs text pasted into search input and opens the bulk import modal if delimeter is present
   * @action onPaste
   * @param {ClipboardEvent} pasteEvent
   */
  // TODO Paste has been disabled since bulk import is not working
  onPaste(pasteEvent: ClipboardEvent) {
    // Get pasted data via clipboard API
    const clipboardData = pasteEvent.clipboardData;
    const pastedData = clipboardData?.getData('Text') || '';
    const queryIds = pastedData.split(BULK_IMPORT_DELIMITER).map((s) => s.trim());
    const isBulkImportRequest = queryIds.length > 1;

    if (isBulkImportRequest) {
      this._showBulkImport = true;
      this._bulkImportQueryIds = queryIds;
      this._bulkImportRawValue = pastedData;
    }
  }
}
