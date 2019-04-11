/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{#table-renderer-vertical-collection
 *   tableData=tableData
 *   request=request
 *   columns=columns
 *   occlusion=occlusion
 *   estimateHeight=estimateHeight
 *   bufferSize=bufferSize
 *   isEditingMode=isEditingMode
 *   cellRendererPrefix=cellRendererPrefix
 *   headerClicked=(action 'headerClicked')
 *   updateColumnOrder=(action 'updateColumnOrder')
 *   updateColumnDisplayName=(action 'updateColumnDisplayName')
 *   onUpdateReport=(action onUpdateReport)
 * }}
 */
import Component from '@ember/component';
import layout from '../templates/components/table-renderer-vertical-collection';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

/**
 * @constant {String} SCROLL_EVENT - Scroll event name
 */
const SCROLL_EVENT = 'scroll';

/**
 * @constant {String} RESIZE_EVENT - Resize event name
 */
const RESIZE_EVENT = 'didResize';

/**
 * @constant {String} WHEEL_EVENT - event for mouse and trackpad gestures
 */
const WHEEL_EVENT = 'wheel';

export default Component.extend({
  layout,

  classNames: ['table-widget-container', 'table-widget-container--vc'],

  /**
   * @property {Service} resize - Resize service to respond to view resize events
   */
  resize: service(),

  /**
   * @property {ResizeObserver} -- chrome resize observer
   */
  resizeObserver: null,

  /**
   * @property {String} tableWrapperClass - class of table wrapper div
   */
  tableWrapperClass: 'table-widget__table-wrapper',

  /**
   * @property {Object} tableWrapperDomElement - table wrapper div DOM element
   */
  tableWrapperDomElement: computed(function() {
    return this.element.querySelector(`.${get(this, 'tableWrapperClass')}`);
  }),

  /**
   * @property {String} tableHeadersClass - class of outer div of visible table headers
   */
  tableHeadersClass: 'table-widget__table-headers',

  /**
   * @property {Object} tableHeadersDomElement - outer div of visible table headers DOM element
   */
  tableHeadersDomElement: computed(function() {
    return this.element.querySelector(`.${get(this, 'tableHeadersClass')}`);
  }),

  /**
   * @property {Boolean} isDragged - whether or not a table header is being dragged (re-ordered)
   */
  isDragged: false,

  /**
   * @method init
   * @override
   */
  init() {
    this._super(...arguments);
    set(this, 'columnsWidth', []);
  },

  /**
   * Registers table scroll event
   *
   * @method _registerTableScroll
   * @private
   * @returns {void}
   */
  _registerTableScroll() {
    [get(this, 'tableWrapperDomElement'), get(this, 'tableHeadersDomElement')].forEach(elm =>
      elm.addEventListener(SCROLL_EVENT, () => this._syncScroll())
    );

    get(this, 'tableHeadersDomElement').addEventListener(WHEEL_EVENT, e => this._headerWheelSync(e));

    //chrome better behavior
    if (typeof window.ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this._syncHeadersWidth();
      });
      document.querySelectorAll('.table-header-row-vc th').forEach(el => resizeObserver.observe(el));
      set(this, 'resizeObserver', resizeObserver);
    }
  },

  /**
   * Registers view resize event
   *
   * @method _registerViewResize
   * @private
   * @returns {void}
   */
  _registerViewResize() {
    get(this, 'resize').on(RESIZE_EVENT, () => {
      this._syncHeadersWidth();
      this._syncScroll();
    });
  },

  /**
   * Synchronizes scroll position of table headers and table body
   *
   * @method _syncScroll
   * @private
   * @returns {void}
   */
  _syncScroll() {
    let scrollableWrapper = get(this, 'tableWrapperDomElement'),
      tableHeaderRow = get(this, 'tableHeadersDomElement'),
      scrollLeft,
      elementToScroll;

    if (get(this, 'isEditingMode')) {
      return;
    }

    if (get(this, 'isDragged')) {
      //when re-ordering columns - set horizontal scroll position of table to that of the headers
      scrollLeft = tableHeaderRow.scrollLeft;
      elementToScroll = scrollableWrapper;
    } else {
      //otherwise - set horizontal scroll position of headers to that of the table
      scrollLeft = scrollableWrapper.scrollLeft;
      elementToScroll = tableHeaderRow;
    }

    elementToScroll.scrollLeft = scrollLeft;
  },

  /**
   * Synchronizes the width of visible table headers with real (hidden) table header elements
   *
   * @method _syncHeadersWidth
   * @private
   * @returns {void}
   */
  _syncHeadersWidth() {
    //in editing mode the real table headers are visible, no need to sync
    if (get(this, 'isEditingMode')) {
      return;
    }

    let widths = Array.from(this.element.querySelectorAll('.table-header-row-vc th')).map(
      elm => elm.getBoundingClientRect().width
    );

    let prevWidths = get(this, 'columnsWidth'),
      widthChanged = widths.length !== prevWidths.length; //if number of columns has changed, set to true to re-set width

    this.element.querySelectorAll('.table-header-row-vc--view .table-header-cell').forEach((headerElm, i) => {
      let headerElmWidth = parseInt(headerElm.style.minWidth);

      if (!headerElmWidth || widths[i] !== prevWidths[i]) {
        headerElm.style.minWidth = `${widths[i]}px`;
        widthChanged = true;
      }
    });

    //set total width to headers wrapper div
    let headerRowElm = this.element.querySelector('.table-header-row-vc--view'),
      headerRowStyle = parseInt(headerRowElm.style.minWidth);

    if (!headerRowStyle || widthChanged) {
      set(this, 'columnsWidth', widths);
      headerRowElm.style.minWidth = `${this.element.querySelector('table').getBoundingClientRect().width}px`;
    }
  },

  /**
   * Event handler for wheel events in header to scroll the table body vertically.
   * Works for mouse wheels and vertical scrolling via mousepad gestures.
   * @param {Event} event - wheel event
   * @private
   * @returns {void}
   */
  _headerWheelSync(event) {
    let table = get(this, 'tableWrapperDomElement');

    table.scrollLeft += event.deltaX;
    event.preventDefault(); // Prevents the page navigation gesture in Mac OSX
  },

  /**
   * attach scroll and view resize event listeners when first rendered
   *
   * @method didInsertElement
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    run.scheduleOnce('afterRender', () => {
      if (!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
        this._registerTableScroll();
        this._registerViewResize();
      }
    });
  },

  /**
   * during both render and re-render, sync headers width and scroll position
   *
   * @method didRender
   * @override
   */
  didRender() {
    this._super(...arguments);

    if (!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
      this._syncHeadersWidth();
      this._syncScroll();
    }
  },

  /**
   * turn off event listeners before removing from the DOM
   *
   * @method willDestroyElement
   * @override
   */
  willDestroyElement() {
    //turn off scroll listener
    [get(this, 'tableWrapperDomElement'), get(this, 'tableHeadersDomElement')].forEach(elm =>
      elm.removeEventListener(SCROLL_EVENT, () => this._syncScroll())
    );

    get(this, 'tableHeadersDomElement').removeEventListener(WHEEL_EVENT, e => this._headerWheelSync(e));

    //turn off view resize listener
    get(this, 'resize').off(RESIZE_EVENT);

    //turn off resize Observer
    get(this, 'resizeObserver').disconnect();

    this._super(...arguments);
  }
});
