/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviListSelector
 *      @title={{title}}
 *      @items={{items}}
 *      @searchField={{searchField}}
 *      @selected={{selected}}
 *      @contentClass={{contentClass}}
 *      as | items |
 *   >
 *      {{yield items}}
 *   </NaviListSelector>
 */

import Component from '@ember/component';
import { set, computed } from '@ember/object';
import layout from '../templates/components/navi-list-selector';
import { searchRecords } from 'navi-core/utils/search';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NaviListSelector extends Component {
  /*
   * @property {Boolean} showSelected
   */
  showSelected = false;

  /*
   * @property {String} errorMessage
   */
  @computed('query', 'showSelected', 'title')
  get errorMessage() {
    if (this.query?.length > 0) {
      return `No ${this.title?.toLowerCase()} found`;
    } else if (this.showSelected) {
      return `No ${this.title?.toLowerCase()} selected`;
    }
    return '';
  }

  /**
   * @property {Boolean} areItemsFiltered - true if items are filtered by selected state or a search query
   */
  @computed('showSelected', 'query')
  get areItemsFiltered() {
    return !!this.showSelected || !!this.query;
  }

  /*
   * @property {Array} filteredItems - items filtered either by selected and by searchQuery
   */
  @computed('items', 'query', 'searchField', 'selected', 'showSelected')
  get filteredItems() {
    const { query, showSelected } = this,
      //set items to selected or all items based on showSelected
      items = showSelected ? this.selected : this.items;

    //filter items by searchQuery
    if (query) {
      return searchRecords(items, query, this.searchField);
    }

    return items;
  }

  /**
   * Called when the attributes passed into the component have been changed
   * @method didUpdateAttrs
   */
  didUpdateAttrs() {
    this._super(...arguments);

    // For convenience, automatically take user to "Show All" when nothing is selected
    if (!this.selected?.length) {
      set(this, 'showSelected', false);
    }
  }
}

export default NaviListSelector;
