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
import { readOnly, mapBy } from '@ember/object/computed';
import Component from '@ember/component';
import { get, computed, action } from '@ember/object';
import { A as arr } from '@ember/array';
import layout from '../templates/components/dimension-selector';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { getDefaultTimeGrain } from 'navi-reports/utils/request-table';

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

export default class DimensionSelector extends Component {
  layout = layout;

  /*
   * @property {Array} classNames
   */
  classNames = ['checkbox-selector', 'checkbox-selector--dimension'];

  /*
   * @property {Array} allDimensions
   */
  @computed('request.logicalTable.table.{dimensions,timeDimensions}')
  get allDimensions() {
    const { dimensions, timeDimensions } = this.request.logicalTable.table;
    return [...dimensions, ...timeDimensions];
  }

  /*
   * @property {Array} timeGrains - copy of all time grains for the logical table selected
   */
  @readOnly('request.logicalTable.table.timeGrains')
  timeGrains;

  /*
   * @property {Array} allTimeGrains - all time grains for the logical table selected
   */
  @computed('timeGrains')
  get allTimeGrains() {
    const { timeGrains } = this;

    return timeGrains
      .filter(grain => grain?.id !== 'all')
      .map(grain =>
        Object.assign({}, grain, {
          category: 'Time Grain',
          dateTimeDimension: true
        })
      );
  }

  /*
   * @property {Object} defaultTimeGrain - the default time grain for the logical table selected
   */
  @computed('allTimeGrains')
  get defaultTimeGrain() {
    return getDefaultTimeGrain(this.allTimeGrains);
  }

  /*
   * @property {Array} listItems - all list items to populate the dimension selector,
   *                               combination of timegrains and dimensions
   */
  @computed('allTimeGrains', 'allDimensions')
  get listItems() {
    let timeGrains;

    if (featureFlag('enableRequestPreview')) {
      // only option is to add the default time grain (if none is selected)
      timeGrains = [
        {
          name: 'Date Time',
          category: 'Date',
          dateTimeDimension: true
        }
      ];
    } else {
      timeGrains = this.allTimeGrains;
    }

    return [...timeGrains, ...this.allDimensions];
  }

  /*
   * @property {Array} selectedDimensions - dimensions in the request
   */
  @mapBy('request.dimensions', 'dimension')
  selectedDimensions;

  /*
   * @property {Array} selectedFilters - filters in the request
   */
  @computed('request.filters.[]')
  get selectedFilters() {
    return get(this, 'request.filters').mapBy('dimension');
  }

  /*
   * @property {Object} selectedTimeGrain - timeGrain in the request
   */
  @computed('request.logicalTable.timeGrain', 'allTimeGrains')
  get selectedTimeGrain() {
    const {
      allTimeGrains,
      request: {
        logicalTable: { timeGrain }
      }
    } = this;

    return allTimeGrains.find(grain => grain.id === timeGrain);
  }

  /*
   * @property {Object} selectedColumnsAndFilters - combination of selectedColumns and SelectedFilters
   */
  @computed('selectedColumns', 'selectedFilters')
  get selectedColumnsAndFilters() {
    return arr([...get(this, 'selectedColumns'), ...get(this, 'selectedFilters')]).uniq();
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
    return get(this, 'selectedColumns').reduce((items, item) => {
      items[get(item, 'id')] = true;
      return items;
    }, {});
  }

  /*
   * @property {Object} dimensionsFiltered - dimension -> boolean mapping denoting presence of dimension
   *                                         in request filters
   */
  @computed('request.filters.[]')
  get dimensionsFiltered() {
    return get(this, 'request.filters')
      .mapBy('dimension.id')
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
    const enableRequestPreview = featureFlag('enableRequestPreview');

    let actionHandler;

    if (enableRequestPreview) {
      if (type === 'TimeGrain' && !this.selectedTimeGrain) {
        return this.onAddTimeGrain?.(this.defaultTimeGrain);
      } else if (type === 'Dimension') {
        actionHandler = 'Add';
      }
    } else {
      actionHandler = this.itemsChecked[item.id] ? 'Remove' : 'Add';
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
    if (featureFlag('enableRequestPreview')) {
      const button = target.closest('button.grouped-list__item-label');
      throttle(this, 'doItemClicked', item, button, THROTTLE_TIME);
      BlurOnAnimationEnd(target, button);
    } else {
      this.doItemClicked(item, null);
    }
  }
}
