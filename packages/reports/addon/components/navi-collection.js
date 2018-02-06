/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-collection
 *      model=model
 *      itemType='item type'
 *      config=(hash
 *          actions='actions-component'
 *          itemRoute='route for item link'
 *          itemNewRoute='route for new item link'
 *          emptyMsg='error message when items is empty'
 *          filterable='boolean flag for a filterable table'
 *       )
 *   }}
 */
import Ember from 'ember';
import layout from '../templates/components/navi-collection';

const { computed, get } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['navi-collection'],

  /**
   * @param {Object} filter - current report table filter
   */
  filters: computed('model', function() {
    return Object.keys(get(this, 'model'));
  }),

  selectedFilter: computed('filters', function() {
    return get(this, 'filters')[0];
  }),

  /**
   *
   * @property {Array} filteredReports -  array of reports filtered by user selected filter
   */
  filteredItems: computed('model', 'selectedFilter', function() {
    let { model, selectedFilter } = this.getProperties('model', 'selectedFilter');

    return get(model, selectedFilter);
  }),

  /**
   * @property {String} itemRoute - routes to ${itemType}.${item} by default
   */
  itemRoute: computed('itemType', 'selectedFilter', function() {
    let itemType  = get(this, 'itemType');

    if(get(this, 'selectedFilter') === 'collections') {
      return `${itemType}Collections.collection`;
    }

    return `${itemType}s.${itemType}`;z
  }),

  /**
   * @property {String} itemNewRoute - routes to ${itemType}.new by default
   */
  itemNewRoute: computed('selectedFilter', 'config.itemNewRoute', function() {
    if(get(this, 'selectedFilter') === 'collections') return undefined;

    return get(this, 'config.itemNewRoute') || `${get(this, 'itemType')}s.new`;
  })
});
