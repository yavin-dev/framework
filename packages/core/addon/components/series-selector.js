/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#series-selector}}
 *      availableSeriesData=availableSeriesData
 *      seriesDimensions=seriesDimensions
 *      selectionIndex=indexOfSeriesBeingSelected
 *      disableAdd=disableAdd
 *      addSeries=(action 'addSeries')
 *   {{/series-selector}}
 */
import Ember from 'ember';
import Search from 'navi-core/utils/search';
import DebouncedPropertiesMixin from 'ember-debounced-properties/mixin';
import layout from '../templates/components/series-selector';

const { computed, get, observer, set } = Ember;

/**
 * @constant {Number} SCROLL_BUFFER - % of remaining scroll height used to fire pagination
 */
const SCROLL_BUFFER = 20;

/**
 * @constant {String} SCROLL_EVENT - Scroll event name
 */
const SCROLL_EVENT = 'scroll.seriesSelectorTable';

export default Ember.Component.extend(DebouncedPropertiesMixin, {
  layout,

  /**
   * @property {Array} classNames - Array of class names
   */
  classNames: ['series-selector'],

  /**
   * @property {Array} debouncedProperties - list of properties to debounce
   */
  debouncedProperties: ['searchTerm'],

  /**
   * @property {Number} searchTermDelay - number of milliseconds to wait for user to stop typing search term
   */
  searchTermDelay: 250,

  /**
   * @property {Array} paginatedSeriesData - paginated version of filterSeriesData
   */
  paginatedSeriesData: undefined,

  /**
   * @property {Array} filteredSeriesData - data filtered by search query
   */
  filteredSeriesData: computed('debouncedSearchTerm', 'availableSeriesData', function() {
    let query = get(this, 'debouncedSearchTerm'),
      searchBy = 'searchKey',
      items = get(this, 'availableSeriesData');

    // Empty query returns all items
    if (Ember.isBlank(query)) {
      return items;
    }

    // Filter items based on whether "searchBy" property matches search term
    return items.filter(item => {
      // Ignore word order and text case when searching
      return Search.getPartialMatchWeight(get(item, searchBy).toLowerCase(), query.toLowerCase());
    });
  }),

  /**
   * @property {Boolean} showTooltip - boolean to control tooltip's display property
   */
  showTooltip: false,

  /**
   * @property {String} scrollableContainerClass - Class added to scrollable container div
   */
  scrollableContainerClass: 'scrollable-container',

  /**
   * @property {Number} pageSize - Number of rows to render at a time
   */
  pageSize: 100,

  /**
   * @property {Number} currentPage - Current content page
   */
  currentPage: 0,

  /**
   * Hook called after component insert into the DOM
   *
   * @method didInsertElement
   * @override
   */
  didInsertElement() {
    this._registerTableScroll();
    this._filteredDataDidChange();
  },

  /**
   * Fires on component destruction
   *
   * @method willDestroyElement
   * @override
   */
  willDestroyElement() {
    //turning off scroll listener
    Ember.$(`.${get(this, 'scrollableContainerClass')}`).off(SCROLL_EVENT);
  },

  /**
   * Registers scroll event
   *
   * @method _registerTableScroll
   * @private
   * @returns {void}
   */
  _registerTableScroll() {
    let scrollableContainer = this.$(`.${get(this, 'scrollableContainerClass')}`);

    scrollableContainer.on(SCROLL_EVENT, this, () => {
      if (
        scrollableContainer.scrollTop() + scrollableContainer.innerHeight() >=
        scrollableContainer[0].scrollHeight * (1 - SCROLL_BUFFER / 100)
      ) {
        this._paginate();
      }
    });
  },

  /**
   * Fires when the filter data is updated
   * @private
   * @method _filteredDataDidChange
   * @returns {Void}
   */
  _filteredDataDidChange: observer('filteredSeriesData', function() {
    //Reset the paginated series
    set(this, 'currentPage', 0);

    let firstPage = get(this, 'filteredSeriesData').slice(0, get(this, 'pageSize'));
    set(this, 'paginatedSeriesData', firstPage);

    //Reset the scroll to the top
    this.$(`.${get(this, 'scrollableContainerClass')}`).scrollTop(0);
  }),

  /**
   * Puts the next page of series on the paginatedSeriesData array
   * @private
   * @method _paginate
   * @returns {Void}
   */
  _paginate() {
    let filteredData = get(this, 'filteredSeriesData'),
      paginatedData = get(this, 'paginatedSeriesData'),
      currentPage = get(this, 'currentPage'),
      pageSize = get(this, 'pageSize');

    if (pageSize * currentPage < get(filteredData, 'length')) {
      let newPage = this.incrementProperty('currentPage'),
        offset = newPage * pageSize;
      paginatedData.pushObjects(filteredData.slice(offset, offset + pageSize));
    }
  },

  /**
   * @event mouseEnter
   */
  mouseEnter() {
    if (get(this, 'disableAdd')) {
      set(this, 'showTooltip', true);
    }
  },

  /**
   * @event mouseLeave
   */
  mouseLeave() {
    set(this, 'showTooltip', false);
  },

  actions: {
    /**
     * @action formToggled - focus and highlight search text when opening the add series form
     */
    formToggled(isFormOpen) {
      if (isFormOpen) {
        Ember.run.next(() => {
          this.$('.search input').select();
        });
      }
    }
  }
});
