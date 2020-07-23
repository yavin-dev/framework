/**
 * Copyright 2020, Yahoo Holdings Inc.
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

import { throttle } from '@ember/runloop';
import Component from '@ember/component';
import { computed, action } from '@ember/object';
import { A as arr } from '@ember/array';
import layout from '../templates/components/dimension-selector';
import { getDefaultTimeGrain } from 'navi-reports/utils/request-table';
import { inject as service } from '@ember/service';

export const THROTTLE_TIME = 750; // milliseconds

const ANIMATIONS = {
  animation: 'animationend',
  OAnimation: 'oAnimationEnd',
  MozAnimation: 'animationend',
  WebkitAnimation: 'webkitAnimationEnd'
};

/**
 * Blur button at the end of the target's animation
 * @param {Element} target - grouped-list__item-container--selected element for the clicked item that will play the animation
 * @param {Element} button - grouped-list__item-label element that is the button that fired off the action
 */
export function BlurOnAnimationEnd(target, button) {
  const listItemContainer = target.closest('.grouped-list__item-container--selected');
  if (listItemContainer) {
    // Detect the end of the css animation depending on browser and blur the button
    let animationEndEvent;
    for (let animation in ANIMATIONS) {
      if (listItemContainer.style[animation] != undefined) {
        animationEndEvent = ANIMATIONS[animation];
      }
    }

    if (animationEndEvent) {
      listItemContainer.addEventListener(animationEndEvent, () => button.blur(), { once: true });
    }
  }
}

const IS_DIMENSION = c => c.type === 'time-dimension' || c.type === 'dimension';

export default class DimensionSelector extends Component {
  layout = layout;

  /*
   * @property {Array} classNames
   */
  classNames = ['checkbox-selector', 'checkbox-selector--dimension'];

  @service bardMetadata;

  @computed('request.{dataSource,table}')
  get currentTable() {
    const { dataSource, table } = this.request;
    return this.bardMetadata.getById('table', table, dataSource);
  }

  /*
   * @property {Array} allDimensions
   */
  @computed('currentTable')
  get allDimensions() {
    const { dimensions, timeDimensions } = this.currentTable;
    return [...dimensions, ...timeDimensions];
  }

  /*
   * @property {Object} defaultTimeGrain - the default time grain for the logical table selected
   */
  @computed('currentTable.timeGrains')
  get defaultTimeGrain() {
    return getDefaultTimeGrain(this.currentTable.timeGrains);
  }

  /*
   * @property {Array} listItems - all list items to populate the dimension selector,
   *                               combination of timegrains and dimensions
   */
  @computed('allTimeGrains', 'allDimensions')
  get listItems() {
    return [
      {
        name: 'Date Time',
        category: 'Date',
        dateTimeDimension: true
      },
      ...this.allDimensions
    ];
  }

  /*
   * @property {Array} selectedDimensions - dimensions in the request
   */
  @computed('request.columns.[]')
  get selectedDimensions() {
    return this.request.columns.filter(IS_DIMENSION);
  }

  /*
   * @property {Array} selectedFilters - filters in the request
   */
  @computed('request.filters.[]')
  get selectedFilters() {
    return this.request.filters.filter(IS_DIMENSION);
  }

  /*
   * @property {Object} selectedTimeGrain - timeGrain in the request
   */
  @computed('request.timeGrain', 'currentTable.timeGrains')
  get selectedTimeGrain() {
    const { currentTable, request } = this;
    return currentTable.timeGrains.find(grain => grain.id === request.timeGrain);
  }

  /*
   * @property {Object} selectedColumnsAndFilters - combination of selectedColumns and SelectedFilters
   */
  @computed('selectedColumns', 'selectedFilters')
  get selectedColumnsAndFilters() {
    const { selectedColumns, selectedFilters } = this;
    return arr([...selectedColumns, ...selectedFilters]).uniq();
  }

  /*
   * @property {Object} selectedColumns - unique selectedDimensions
   */
  @computed('selectedTimeGrain', 'selectedDimensions')
  get selectedColumns() {
    if (!this.selectedTimeGrain) {
      return this.selectedDimensions;
    } else {
      return arr([this.selectedTimeGrain, ...this.selectedDimensions]).uniq();
    }
  }

  /*
   * @property {Object} itemsChecked - item -> boolean map to denote if item should be checked
   */
  @computed('selectedColumns')
  get itemsChecked() {
    return this.selectedColumns.reduce((items, item) => {
      items[item.id] = true;
      return items;
    }, {});
  }

  /*
   * @property {Object} dimensionsFiltered - dimension -> boolean mapping denoting presence of dimension
   *                                         in request filters
   */
  @computed('request.filters.[]')
  get dimensionsFiltered() {
    return this.request.filters
      .filter(IS_DIMENSION)
      .map(f => f.field)
      .reduce((list, dimension) => {
        list[dimension] = true;
        return list;
      }, {});
  }

  /**
   * Pass clicked dimenion to action handler
   * @param {Object} item - grouped list item for clicked dimension
   * @param {Node} target - DOM Node for clicked dimension
   */
  doItemClicked(item, target) {
    target && target.focus(); // firefox does not focus a button on click in MacOS specifically
    const type = item.dateTimeDimension ? 'TimeGrain' : 'Dimension';

    let actionHandler;

    if (type === 'TimeGrain') {
      return this.onAddTimeGrain?.(this.selectedTimeGrain || this.defaultTimeGrain);
    } else if (type === 'Dimension') {
      actionHandler = 'Add';
    }

    if (actionHandler) {
      this[`on${actionHandler}${type}`]?.(item);
    }
  }

  /**
   * @action
   * @param {Object} item - grouped list item for clicked dimension
   * @param {Event.target} target - clicked dimension element
   */
  @action
  itemClicked(item, { target }) {
    const button = target.closest('button.grouped-list__item-label');
    throttle(this, 'doItemClicked', item, button, THROTTLE_TIME);
    BlurOnAnimationEnd(target, button);
  }
}
