/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * List of items with show more functionality and infinite scroll
 *
 * Usage:
 *   {{#paginated-scroll-list
 *      items=itemsArray - {Array} array of items object
 *      trim=trimFlag {Boolean} - control for trimmed state (two-way binding)
 *      showMore=(action actionToTrigger) - [optional] {action} action to trigger on show more
 *      moreLabel='Show More' [optional] {String} show more text
 *      initialItemsToRender=20 - [optional] {Number} min number of items to render initially, default 20
 *      perPage=250 - [optional] {Number} number of items to load per page on scroll, default 250
 *      scrollPadding=250 - [optional] {Number} padding from bottom of scroll to initiate loading of more items, default 250
 *      as |item|
 *   }}
 *      {{item.longName}}
 *   {{/paginated-scroll-list}}
 *
 *
 * styles examples:
 *   .paginated-scroll-list {
 *      .trimmed {
 *          max-height: 3 * @pill-height;
 *          overflow: hidden;
 *      }
 *      .show-all {
 *          max-height: 6 * @pill-height;
 *          overflow: auto;
 *      }
 *   }
 */
import { A } from '@ember/array';

import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import { run } from '@ember/runloop';
import layout from '../templates/components/paginated-scroll-list';

const DEFAULT_ITEMS_TO_RENDER = 20,
  DEFAULT_PER_PAGE = 250,
  DEFAULT_SCROLL_PADDING = 250;

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['paginated-scroll-list'],

  /**
   * @private
   * @property {String} _containerClass - class of container containing items, Wrapper for <ul>
   */
  _containerClass: 'items-container',

  /**
   * @private
   * @property {String} _collectionClass - class of <ul> containing the elements
   * Caution: ul.items-list element is used for height computation. Do not explicitly style its height!
   */
  _collectionClass: 'items-list',

  /**
   * @property {Array} items - list of items
   */
  items: undefined,

  /**
   * @property {Boolean} trim - if true collection is rendered in trimmed mode (mode with show more link)
   */
  trim: true,

  /**
   * @property {String} moreLabel - show more label
   */
  moreLabel: 'Show more',

  /**
   * @property {Number} initialItemsToRender - min items to render in trimmed state
   */
  initialItemsToRender: DEFAULT_ITEMS_TO_RENDER,

  /**
   * @property {Number} perPage - number of items loaded per page
   */
  perPage: DEFAULT_PER_PAGE,

  /**
   * @private
   * @property {Number} _page - scroll pagination starting page number
   */
  _page: 0,

  /**
   * @property {Number} scrollPadding - padding from bottom of scroll to initiate loading of more items
   */
  scrollPadding: DEFAULT_SCROLL_PADDING,

  /**
   * @private
   * @property {Boolean} _itemsExceedMaxHt - property depicts if items exceed max height
   */
  _itemsExceedMaxHt: false,

  /**
   * @private
   * @property {Array} _itemsToRender - items to render
   */
  _itemsToRender: computed('items.[]', '_perPage', function() {
    return A(get(this, 'items').slice(0, get(this, '_perPage')));
  }),

  /**
   * @private
   * @property {Boolean} _isTrimmed - true of items collection is trimmed else false
   */
  _isTrimmed: computed('trim', '_itemsExceedMaxHt', '_hasMoreItems', function() {
    return get(this, 'trim') && (get(this, '_itemsExceedMaxHt') || get(this, '_hasMoreItems'));
  }),

  /**
   * @private
   * @property {Number} _perPage - number of items loaded per page based on trim flag
   */
  _perPage: computed('trim', 'perPage', function() {
    if (get(this, 'trim')) {
      return get(this, 'initialItemsToRender');
    }
    return get(this, 'perPage');
  }),

  /**
   * Hook to execute after every render and re-render
   *
   * @event didRender
   */
  didRender() {
    this._super(...arguments);
    this._setItemsExceedMaxHt();
  },

  /**
   * @private
   * @property {Boolean} _hasMoreItems - true if infinite scroll has more items to render else false
   */
  _hasMoreItems: computed('items.[]', '_itemsToRender.[]', function() {
    return get(this, 'items.length') > get(this, '_itemsToRender.length');
  }),

  /**
   * Sets _itemsExceedMaxHt property
   *
   * @private
   * @method: _setItemsExceedMaxHt
   * @returns {Void}
   */
  _setItemsExceedMaxHt() {
    let containerSelector = `.${get(this, '_containerClass')}`,
      itemsCollectionSelector = `.${get(this, '_collectionClass')}`,
      itemsExceedMaxHt = this.$(itemsCollectionSelector).outerHeight() > this.$(containerSelector).innerHeight();

    set(this, '_itemsExceedMaxHt', itemsExceedMaxHt);
  },

  /**
   * @event didInsertElement
   */
  didInsertElement() {
    let containerSelector = `.${get(this, '_containerClass')}`;
    // Bind scroll event
    this.$(containerSelector).on('scroll.paginated-scroll', () => {
      run.debounce(this, this.onScroll, 50);
    });
  },

  /**
   * @event willDestroyElement
   */
  willDestroyElement: function() {
    let containerSelector = `.${get(this, '_containerClass')}`;
    // Unbind scroll event
    this.$(containerSelector).off('scroll.paginated-scroll');
  },

  /**
   * @event onScroll - event to trigger on scroll
   */
  onScroll() {
    let containerSelector = `.${get(this, '_containerClass')}`,
      // detect scroll to bottom
      scrolledToBottom =
        this.$(containerSelector).scrollTop() + this.$(containerSelector).innerHeight() >=
        this.$(containerSelector)[0].scrollHeight - this.get('scrollPadding');

    if (scrolledToBottom && get(this, '_hasMoreItems')) {
      this._appendPaginatedResults();
    }
  },

  /**
   * Appends next set of paginated records to display on scroll
   *
   * @private
   * @method _appendPaginatedResults
   * @returns {Void}
   */
  _appendPaginatedResults() {
    this.incrementProperty('_page');

    let perPage = get(this, 'perPage'),
      startIndex = get(this, '_page') * perPage,
      endIndex = startIndex + perPage,
      recordsToAppend = get(this, 'items').slice(startIndex, endIndex);

    A(get(this, '_itemsToRender')).pushObjects(recordsToAppend);
  },

  actions: {
    /**
     * @action onShowMore - action triggered when show more link is clicked
     */
    onShowMore() {
      set(this, 'trim', false);
      get(this, 'attrs.showMore')();
    }
  }
});
