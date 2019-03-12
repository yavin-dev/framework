/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * An ember-power-select options component that uses ember-collection
 */
import { alias } from '@ember/object/computed';

import { A } from '@ember/array';
import { setProperties, get, computed } from '@ember/object';
import Options from 'ember-power-select/components/power-select/options';
import layout from '../templates/components/power-select-collection-options';
import _ from 'lodash';

export default Options.extend({
  layout,

  /**
   * @property {Array} classNames - a list of class names for the component
   */
  classNames: ['power-select-collection-options'],

  /**
   * @property {Number} maxDisplayedItems - max number of item to show at once
   */
  maxDisplayedItems: 6,

  /**
   * @property {Number} itemHeight - height in px of a single item
   */
  itemHeight: 31,

  /**
   * @property {Number} _height - height of selector
   */
  _height: computed('items.length', 'maxDisplayedItems', 'itemHeight', function() {
    let length = get(this, 'items.length'),
      itemHeight = get(this, 'itemHeight'),
      maxDisplayedItems = get(this, 'maxDisplayedItems');

    let height = length * itemHeight,
      maxHeight = maxDisplayedItems * itemHeight;

    return Math.min(maxHeight, height);
  }),

  /**
   * @property {Array} colums - columns sized using percentage widths
   */
  columns: computed(() => [100]),

  /**
   * @property {String} groupKey - option property to group by
   */
  groupKey: alias('extra.groupKey'),

  /**
   * @property {String} sortKey - option property to sort by
   */
  sortKey: alias('extra.sortKey'),

  /**
   * @property {Array} items - array of options to be used by hbs
   */
  items: computed('options', 'groupKey', function() {
    let groupKey = get(this, 'groupKey');

    if (groupKey) {
      return get(this, 'grouped');
    } else {
      return get(this, 'ungrouped');
    }
  }),

  /**
   * @property {Array} indexedOptions - array of options that retain original order
   */
  indexedOptions: computed('options', function() {
    let options = get(this, 'options');
    options.forEach((opt, idx) => {
      setProperties(opt, { idx });
    });
    return options;
  }),

  /**
   * @property {Array} ungrouped - array of ungrouped options
   */
  ungrouped: computed('indexedOptions', 'sortKey', function() {
    let options = get(this, 'indexedOptions');

    return this._sortOptions(options);
  }),

  /**
   * @property {Array} grouped - array of grouped options
   */
  grouped: computed('indexedOptions', function() {
    let options = get(this, 'indexedOptions'),
      groupKey = get(this, 'groupKey');

    let grouped = _.groupBy(options, groupKey);

    return Object.keys(grouped)
      .sort()
      .reduce((previous, groupName) => {
        return [
          ...previous,
          { groupName, groupSize: grouped[groupName].length },
          ...this._sortOptions(grouped[groupName])
        ];
      }, []);
  }),

  /**
   * @method _sortOptions
   * @private
   * @param {Array} options - array of options
   * @returns {Arrray} array of sorted options if sortKey provided
   */
  _sortOptions(options) {
    let sortKey = get(this, 'sortKey');

    if (sortKey) {
      return A(options).sortBy(sortKey);
    } else {
      return options;
    }
  },

  actions: {
    /**
     * @action clear - clears selection
     */
    clear(e) {
      e.stopPropagation();
      this.get('select.actions.select')([]);
    }
  }
});
