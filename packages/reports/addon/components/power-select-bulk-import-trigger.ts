/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * An ember-power-select trigger component that can import a list of comma separated values on paste
 */
import Trigger from 'ember-power-select/components/power-select-multiple/trigger';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type FilterFragment from 'navi-core/models/request/filter';

type Args = Trigger['args'];
export default class PowerSelectBulkImportTrigger extends Trigger {
  declare args: Args & { extra: { bulkImport: (values: unknown[]) => void; filter: FilterFragment } };
  @tracked showBulkImport = false;

  /**
   * list of ids that were pasted into search input
   */
  @tracked
  bulkImportQueryIds: string[] = [];

  /**
   * String that was pasted into search input
   */
  @tracked
  bulkImportRawValue?: string;

  /**
   * Grabs text pasted into search input and opens the bulk import modal if delimeter is present
   * @param pasteEvent
   */
  @action
  onPaste(pasteEvent: ClipboardEvent) {
    // Get pasted data via clipboard API
    const clipboardData = pasteEvent.clipboardData;
    const pastedData = clipboardData?.getData('Text') || '';
    const isBulkImportRequest =
      pastedData
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0).length > 1;

    if (isBulkImportRequest) {
      this.showBulkImport = true;
      this.bulkImportRawValue = pastedData;
    }
  }
}
