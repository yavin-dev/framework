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
import { computed } from '@ember/object';
import layout from '../templates/components/dimension-bulk-import-simple';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@tagName('')
@templateLayout(layout)
class DimensionBulkImportSimpleComponent extends Component {
  /**
   * Filters the input list to a unique list of nonempty values
   * @param {Array<String>} list - the list to filter
   */
  listFilter(list) {
    const filter = list
      .map(v => v.trim()) // remove surrounding space
      .filter(v => v.length > 0); // remove empty values
    return [...new Set(filter)]; // only unique values
  }

  /**
   * @property {Array<String>} unsplitValue - empty/single value array of rawInput
   */
  @computed('rawInput')
  get input() {
    return this.rawInput || '';
  }

  /**
   * @property {Array<String>} unsplitValue - empty/single value array of rawInput
   */
  @computed('input')
  get unsplitValue() {
    return this.listFilter([this.input]);
  }

  /**
   * @property {Array<String>} splitValues - array of values split by commas from rawInput
   */
  @computed('input')
  get splitValues() {
    return this.listFilter(this.input.split(','));
  }
}

export default DimensionBulkImportSimpleComponent;
