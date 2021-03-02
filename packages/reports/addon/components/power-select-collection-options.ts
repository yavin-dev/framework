/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * An ember-power-select options component that uses ember-collection
 */
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';
import { action, setProperties, computed } from '@ember/object';
import Options from 'ember-power-select/components/power-select/options';
import { groupBy } from 'lodash-es';

export default class PowerSelectCollectionOptions extends Options {
  /**
   * @property {Number} maxDisplayedItems - max number of item to show at once
   */
  maxDisplayedItems = 6;

  /**
   * @property {Number} itemHeight - height in px of a single item
   */
  itemHeight = 36;

  /**
   * @property {Number} _height - height of selector
   */
  @computed('args.select.resultsCount', 'itemHeight', 'items.length', 'maxDisplayedItems')
  get _height() {
    const length = this.args.select.resultsCount;
    const { itemHeight, maxDisplayedItems } = this;
    const height = length * itemHeight;
    const maxHeight = maxDisplayedItems * itemHeight;
    return Math.min(maxHeight, height);
  }

  /**
   * @property {Array} colums - columns sized using percentage widths
   */
  columns = [100];

  /**
   * @property {String} groupKey - option property to group by
   */
  @alias('args.extra.groupKey')
  groupKey!: string;

  /**
   * @property {String} sortKey - option property to sort by
   */
  @alias('args.extra.sortKey')
  sortKey!: string;

  /**
   * @property {Array} items - array of options to be used by hbs
   */
  @computed('args.options', 'groupKey', 'grouped', 'ungrouped')
  get items() {
    return this.groupKey ? this.grouped : this.ungrouped;
  }

  /**
   * @property {Array} indexedOptions - array of options that retain original order
   */
  @computed('args.options')
  get indexedOptions() {
    const { options } = this.args;
    options.forEach((opt: {}, idx: number) => {
      setProperties(opt, { idx });
    });
    return options;
  }

  /**
   * @property {Array} ungrouped - array of ungrouped options
   */
  @computed('indexedOptions', 'sortKey')
  get ungrouped() {
    return this._sortOptions(this.indexedOptions);
  }

  /**
   * @property {Array} grouped - array of grouped options
   */

  @computed('indexedOptions', 'groupKey')
  get grouped() {
    const { indexedOptions: options, groupKey } = this;
    const grouped = groupBy(options, groupKey);

    return Object.keys(grouped)
      .sort()
      .reduce((previous, groupName) => {
        return [
          ...previous,
          { groupName, groupSize: grouped[groupName].length },
          ...this._sortOptions(grouped[groupName]),
        ];
      }, []);
  }

  /**
   * @method _sortOptions
   * @private
   * @param {Array} options - array of options
   * @returns {Arrray} array of sorted options if sortKey provided
   */
  _sortOptions(options: {}[]) {
    const { sortKey } = this;
    return sortKey ? A(options).sortBy(sortKey) : options;
  }

  @action
  clear(e: Event) {
    e.stopPropagation();
    this.args.select.actions.select([]);
  }
}
