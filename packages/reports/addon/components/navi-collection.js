/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-collection
 *      items=items
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
import { oneWay, or } from '@ember/object/computed';

import { A } from '@ember/array';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import layout from '../templates/components/navi-collection';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['navi-collection'],

  /**
   * @property {DS.ArrayPromise} reports - array of reports
   */
  items: undefined,

  /**
   * @param {Object} filter - current report table filter
   */
  filter: oneWay('filterOptions.firstObject'),

  /**
   *
   * @property {Array} filteredReports -  array of reports filtered by user selected filter
   */
  filteredItems: computed('items.[]', 'filter', function() {
    let { items, filter } = this.getProperties('items', 'filter');

    return isEmpty(items) ? undefined : filter.filterFn(items);
  }),

  /**
   * @property {String} itemRoute - routes to ${itemType}.${item} by default
   */
  itemRoute: computed('config.itemRoute', function() {
    let itemType = get(this, 'itemType'),
      itemRoute = get(this, 'config.itemRoute') || `${itemType}s.${itemType}`;

    return itemRoute;
  }),

  /**
   * @property {String} itemNewRoute - routes to ${itemType}.new by default
   */
  itemNewRoute: computed('config.itemNewRoute', function() {
    let itemType = get(this, 'itemType'),
      itemNewRoute = get(this, 'config.itemNewRoute') || `${itemType}s.new`;

    return itemNewRoute;
  }),

  /**
   * @param {Array} filterOptions - list of filters for the report table
   */
  filterOptions: A([
    {
      filterFn: item => item,
      name: 'All'
    },
    {
      filterFn: items => items.filterBy('isFavorite'),
      name: 'Favorites'
    }
  ]),

  /**
   * @property {Boolean} hasTableLoaded - indicates if table has loaded
   */
  hasTableLoaded: or('items.isSettled', 'items.isLoaded')
});
