/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * An ember-power-select trigger component that can import a list of comma separated values on paste
 */
import { A } from '@ember/array';

import { setProperties, set, get } from '@ember/object';
import Trigger from 'ember-power-select/components/power-select-multiple/trigger';
import layout from '../templates/components/power-select-bulk-import-trigger';

const BULK_IMPORT_DELIMETER = ',';

export default Trigger.extend({
  layout,

  /**
   * @param {Boolean} _showBulkImport
   * @private
   */
  _showBulkImport: false,

  /**
   * @param {Array} bulkImportQueryIds - list of ids that were pasted into search input
   * @private
   */
  _bulkImportQueryIds: undefined,

  /**
   * @method init
   * @override
   */
  init() {
    this._super(...arguments);
    set(this, '_bulkImportQueryIds', []);
  },

  actions: {
    /**
     * @action importValues
     * @param {Array} values - list of power select options to select
     */
    importValues(values) {
      let oldSelection = get(this, 'select.selected'),
        newSelection = A([...oldSelection, ...values]).uniq();

      get(this, 'select.actions').select(newSelection);
    },

    /**
     * Grabs text pasted into search input and opens the bulk import modal if delimeter is present
     *
     * @action onPaste
     * @param {ClipboardEvent} pasteEvent
     */
    onPaste(pasteEvent) {
      // Get pasted data via clipboard API
      let clipboardData = pasteEvent.clipboardData || window.clipboardData,
        pastedData = clipboardData.getData('Text'),
        queryIds = pastedData.split(BULK_IMPORT_DELIMETER).map(s => s.trim()),
        isBulkImportRequest = queryIds.length > 1;

      if (isBulkImportRequest) {
        setProperties(this, {
          _showBulkImport: true,
          _bulkImportQueryIds: queryIds
        });
      }
    }
  }
});
