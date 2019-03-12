/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#navi-list-selector
 *      title=title
 *      items=items
 *      searchField=field
 *      selected=selected
 *      as | items |
 *   }}
 *      {{yield items}}
 *   {{/navi-list-selector}}
 */

import Component from '@ember/component';

import { set, get, computed } from '@ember/object';
import { or } from '@ember/object/computed';
import layout from '../templates/components/navi-list-selector';
import { searchRecords } from 'navi-core/utils/search';

export default Component.extend({
  layout,

  /*
   * @property {Array} classNames
   */
  classNames: ['navi-list-selector'],

  /*
   * @property {Boolean} showSelected
   */
  showSelected: false,

  /*
   * @property {String} errorMessage
   */
  errorMessage: computed('query', 'showSelected', 'title', function() {
    if (get(this, 'query.length') > 0) {
      return `No ${get(this, 'title').toLowerCase()} found`;
    } else if (get(this, 'showSelected')) {
      return `No ${get(this, 'title').toLowerCase()} selected`;
    }
  }),

  /**
   * @property {Boolean} areItemsFiltered - true if items are filtered by selected state or a search query
   */
  areItemsFiltered: or('showSelected', 'query'),

  /*
   * @property {Array} filteredItems - items filtered either by selected and by searchQuery
   */
  filteredItems: computed('items', 'query', 'searchField', 'selected', 'showSelected', function() {
    let query = get(this, 'query'),
      items;

    //set items to selected or all items based on showSelected
    if (get(this, 'showSelected')) {
      items = get(this, 'selected');
    } else {
      items = get(this, 'items');
    }

    //filter items by searchQuery
    if (query) {
      return searchRecords(items, query, get(this, 'searchField'));
    }

    return items;
  }),

  /**
   * Called when the attributes passed into the component have been changed
   *
   * @event didUpdateAttrs
   */
  didUpdateAttrs() {
    // For convenience, automatically take user to "Show All" when nothing is selected
    if (!get(this, 'selected.length')) {
      set(this, 'showSelected', false);
    }
  }
});
