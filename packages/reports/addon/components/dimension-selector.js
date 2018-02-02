/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#dimension-selector
 *      request=request
 *      addDimension=(action 'addDimension')
 *      removeDimension=(action 'removeDimension')
 *      addTimeGrain=(action 'addTimeGrain')
 *      removeTimeGrain=(action 'removeTimeGrain')
 *   }}
 *      {{navi-list-selector}}
 *   {{/dimension-selector}}
 */

import Ember from 'ember';
import layout from '../templates/components/dimension-selector';

const { $, computed, get, set } = Ember;

export default Ember.Component.extend({
  layout,

  /*
   * @property {Array} classNames
   */
  classNames: [ 'checkbox-selector', 'checkbox-selector--dimension' ],

  /*
   * @property {Array} allDimensions
   */
  allDimensions: computed.readOnly('request.logicalTable.timeGrain.dimensions'),

  /*
   * @property {Array} timeGrains - copy of all time grains for the logical table selected
   */
  timeGrains: computed('request.logicalTable.table.timeGrains', function() {
    return $.extend(true, [], get(this, 'request.logicalTable.table.timeGrains'));
  }),

  /*
   * @property {Array} allTimeGrains - all time grains for the logical table selected
   */
  allTimeGrains: computed.filter('timeGrains', function(timeGrain) {
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
    return [
      ...get(this, 'allTimeGrains'),
      ...get(this, 'allDimensions')
    ];
  }),

  /*
   * @property {Array} selectedDimensions - dimensions in the request
   */
  selectedDimensions: computed.mapBy('request.dimensions', 'dimension'),

  /*
   * @property {Object} selectedTimeGrain - timeGrain in the request
   */
  selectedTimeGrain: computed.readOnly('request.logicalTable.timeGrain'),

  /*
   * @property {Object} selectedItems - combination of selectedTimeGrain and selectedDimensions
   */
  selectedItems: computed('selectedTimeGrain', 'selectedDimensions', function() {
    if(get(this, 'selectedTimeGrain.name') === 'all'){
      return get(this, 'selectedDimensions');
    } else {
      return [
        get(this, 'selectedTimeGrain'),
        ...get(this, 'selectedDimensions')
      ];
    }

  }),

  /*
   * @property {Object} itemsChecked - item -> boolean map to denote if item should be checked
   */
  itemsChecked: computed('selectedItems', function() {
    return get(this, 'selectedItems').reduce((items, item) => {
      items[get(item, 'name')] = true;
      return items;
    }, {});
  }),

  /*
   * @property {Object} dimensionsFiltered - dimension -> boolean mapping denoting presence of dimension
   *                                         in request filters
   */
  dimensionsFiltered: computed('request.filters.[]', function() {
    return get(this, 'request.filters').mapBy('dimension.name').reduce((list, dimension) => {
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
      let type = get(item, 'category') === 'Time Grain'? 'TimeGrain' : 'Dimension',
          action = get(this, 'itemsChecked')[get(item, 'name')]? 'remove' : 'add';

      this.sendAction(`${action}${type}`, item);
    }
  }
});
