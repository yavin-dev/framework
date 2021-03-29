/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * An ember-power-select options component that uses ember-collection
 */
import { A } from '@ember/array';
import { action, computed } from '@ember/object';
import Options from 'ember-power-select/components/power-select/options';
import { groupBy } from 'lodash-es';

type ItemOptions = Options['args']['options'];
type Args = Options['args'] & {
  extra?: {
    allowClear?: boolean;
    groupKey?: string;
    sortKey?: string;
    sortFn?: (options: ItemOptions) => ItemOptions;
  };
};

export type IndexedOptions<Option = ItemOptions[number]> = { option: Option; idx: number };

export default class PowerSelectCollectionOptions extends Options {
  declare args: Args;

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
  @computed('args.select.resultsCount', 'itemHeight', 'maxDisplayedItems')
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
   * @property {Array} items - array of options to be used by hbs
   */
  @computed('args.extra.groupKey', 'grouped', 'ungrouped')
  get items() {
    return this.args.extra?.groupKey ? this.grouped : this.ungrouped;
  }

  /**
   * @property {Array} indexedOptions - array of options that retain original order
   */
  @computed('args.{options,select.loading}')
  get indexedOptions(): IndexedOptions[] {
    const {
      options,
      select: { loading },
    } = this.args;
    if (loading) {
      return [];
    }
    return options.map((option: {}, idx: number) => ({ option, idx }));
  }

  /**
   * @property {Array} ungrouped - array of ungrouped options
   */
  @computed('indexedOptions', 'args.extra.{sortKey,sortFn}')
  get ungrouped() {
    return this._sortOptions(this.indexedOptions);
  }

  /**
   * @property {Array} grouped - array of grouped options
   */

  @computed('indexedOptions', 'args.extra.{sortKey,sortFn,groupKey}')
  get grouped() {
    const { indexedOptions: options } = this;
    const { groupKey } = this.args.extra || {};
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
   * @private
   * @param options - array of options
   * @returns array of sorted options if sortKey provided
   */
  _sortOptions(options: IndexedOptions[]) {
    const { sortKey, sortFn } = this.args.extra || {};
    if (sortFn) {
      return sortFn(options);
    } else if (sortKey) {
      return A(options).sortBy(`option.${sortKey}`);
    }
    return options;
  }

  @action
  clear(e: Event) {
    e.stopPropagation();
    this.args.select.actions.select([]);
  }
}
