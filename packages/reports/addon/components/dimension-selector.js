/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#dimension-selector
 *      request=request
 *      onAddDimension=(action 'addDimension')
 *      onRemoveDimension=(action 'removeDimension')
 *      onAddTimeGrain=(action 'addTimeGrain')
 *      onRemoveTimeGrain=(action 'removeTimeGrain')
 *   }}
 *      {{navi-list-selector}}
 *   {{/dimension-selector}}
 */

import { readOnly, filter, mapBy } from '@ember/object/computed';

import Component from '@ember/component';
import { getWithDefault, set, get, computed } from '@ember/object';
import { A as arr } from '@ember/array';
import layout from '../templates/components/dimension-selector';

export default Component.extend({
  layout,

  /*
   * @property {Array} classNames
   */
  classNames: ['checkbox-selector', 'checkbox-selector--dimension'],

  /*
   * @property {Array} allDimensions
   */
  allDimensions: readOnly('request.logicalTable.timeGrain.dimensions'),

  /*
   * @property {Array} timeGrains - copy of all time grains for the logical table selected
   */
  timeGrains: readOnly('request.logicalTable.table.timeGrains'),

  /*
   * @property {Array} allTimeGrains - all time grains for the logical table selected
   */
  allTimeGrains: filter('timeGrains', function(timeGrain) {
    //add category to every timegrain object
    set(timeGrain, 'category', 'Time Grain');

    /*
     *filtering all timegrain, if no option is selected in the list
     *`all` timegrain will be assumed
     */
    return get(timeGrain, 'name') !== 'all';
  }),

  /*
   * @property {Array} listItems - all list items to populate the dimension selector,
   *                               combination of timegrains and dimensions
   */
  listItems: computed('allTimeGrains', 'allDimensions', function() {
    return [...getWithDefault(this, 'allTimeGrains', []), ...getWithDefault(this, 'allDimensions', [])];
  }),

  /*
   * @property {Array} selectedDimensions - dimensions in the request
   */
  selectedDimensions: mapBy('request.dimensions', 'dimension'),

  /*
   * @property {Array} selectedFilters - filters in the request
   */
  selectedFilters: computed('request.filters.[]', function() {
    return get(this, 'request.filters').mapBy('dimension');
  }),

  /*
   * @property {Object} selectedTimeGrain - timeGrain in the request
   */
  selectedTimeGrain: readOnly('request.logicalTable.timeGrain'),

  /*
   * @property {Object} selectedColumnsAndFilters - combination of selectedColumns and SelectedFilters
   */
  selectedColumnsAndFilters: computed('selectedColumns', 'selectedFilters', function() {
    return arr([...get(this, 'selectedColumns'), ...get(this, 'selectedFilters')]).uniq();
  }),

  /*
   * @property {Object} selectedColumns - unique selectedDimensions
   */
  selectedColumns: computed('selectedTimeGrain', 'selectedDimensions', function() {
    if (get(this, 'selectedTimeGrain.name') === 'all') {
      return get(this, 'selectedDimensions');
    } else {
      return arr([get(this, 'selectedTimeGrain'), ...get(this, 'selectedDimensions')]).uniq();
    }
  }),

  /*
   * @property {Object} itemsChecked - item -> boolean map to denote if item should be checked
   */
  itemsChecked: computed('selectedColumns', function() {
    return get(this, 'selectedColumns').reduce((items, item) => {
      items[get(item, 'name')] = true;
      return items;
    }, {});
  }),

  /*
   * @property {Object} dimensionsFiltered - dimension -> boolean mapping denoting presence of dimension
   *                                         in request filters
   */
  dimensionsFiltered: computed('request.filters.[]', function() {
    return get(this, 'request.filters')
      .mapBy('dimension.name')
      .reduce((list, dimension) => {
        list[dimension] = true;
        return list;
      }, {});
  }),

  actions: {
    /*
     * @action itemClicked
     * @param {Object} item
     */
    itemClicked(item) {
      const type = get(item, 'category') === 'Time Grain' ? 'TimeGrain' : 'Dimension';
      const action = get(this, 'itemsChecked')[get(item, 'name')] ? 'Remove' : 'Add';
      const handler = get(this, `on${action}${type}`);

      if (handler) handler(item);
    }
  }
});
