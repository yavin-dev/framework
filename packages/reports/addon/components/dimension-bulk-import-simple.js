/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <DimensionBulkImportSimple
 *      @rawInput="list,of,ids"
 *      @onSelectValues={{this.selectValues}}
 *   />
 */
import Component from '@ember/component';
import { action } from '@ember/object';
import layout from '../templates/components/dimension-bulk-import-simple';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@tagName('')
@templateLayout(layout)
class DimensionBulkImportSimpleComponent extends Component {
  unsplitValue = [];
  splitValues = [];

  /**
   * Filters the input list to a unique list of nonempty values
   * @param {Array<String>} list - the list to filter
   */
  listFilter(list) {
    const filter = list
      .map(v => v.trim()) // remove surrounding space
      .filter(v => v.length > 0); // remove empty values
    return [...new Set(filter)]; // only unique falues
  }

  /**
   * @method didReceiveAttrs
   * @override
   */
  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    const { previousRawInput, rawInput } = this;

    if (previousRawInput !== rawInput) {
      // new input
      let newRawInput = rawInput || '';

      this.set('unsplitValue', this.listFilter([newRawInput]));
      this.set('splitValues', this.listFilter(newRawInput.split(',')));
    }

    this.previousRawInput = rawInput;
  }

  /**
   * Action to trigger on removing pill
   *
   * @method removeRecordAtIndex
   * @param {Number} index - record to be removed from valid results
   * @returns {Void}
   */
  @action
  removeRecordAtIndex(index) {
    const removed = this.splitValues.splice(index, 1);
    this.set('splitValues', [...this.splitValues]);
    return removed;
  }
}

export default DimensionBulkImportSimpleComponent;
