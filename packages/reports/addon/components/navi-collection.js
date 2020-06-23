/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviCollection
 *      @items={{items}}
 *      @itemType="item type"
 *      @config={{hash
 *          actions='actions-component'
 *          itemRoute='route for item link'
 *          itemNewRoute='route for new item link'
 *          emptyMsg='error message when items is empty'
 *          filterable='boolean flag for a filterable table'
 *      }}
 *   />
 */
import { oneWay, or } from '@ember/object/computed';
import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import layout from '../templates/components/navi-collection';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class NaviCollection extends Component {
  /**
   * @property {DS.ArrayPromise} items - array of assets
   */
  items = undefined;

  /**
   * @param {Object} filter - current report table filter
   */
  @oneWay('filterOptions.firstObject')
  filter;

  /**
   *
   * @property {Array} filteredReports -  array of reports filtered by user selected filter
   */
  @computed('items.[]', 'filter')
  get filteredItems() {
    const { items, filter } = this;

    return isEmpty(items) ? undefined : filter.filterFn(items);
  }

  /**
   * @property {String} itemRoute - routes to ${itemType}.${item} by default
   */
  @computed('config.itemRoute')
  get itemRoute() {
    let itemType = get(this, 'itemType'),
      itemRoute = get(this, 'config.itemRoute') || `${itemType}s.${itemType}`;

    return itemRoute;
  }

  /**
   * @property {String} itemNewRoute - routes to ${itemType}.new by default
   */
  @computed('config.itemNewRoute')
  get itemNewRoute() {
    let itemType = get(this, 'itemType'),
      itemNewRoute = get(this, 'config.itemNewRoute') || `${itemType}s.new`;

    return itemNewRoute;
  }

  /**
   * @param {Array} filterOptions - list of filters for the report table
   */
  filterOptions = arr([
    {
      filterFn: item => item,
      name: 'All'
    },
    {
      filterFn: items => items.filterBy('isFavorite'),
      name: 'Favorites'
    }
  ]);

  /**
   * @property {Boolean} hasTableLoaded - indicates if table has loaded
   */
  @or('items.isSettled', 'items.isLoaded') hasTableLoaded;
}
