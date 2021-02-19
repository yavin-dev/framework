/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
   <DimensionSelector
     @request={{this.request}}
     @onAddDimension={{this.onAddDimension}}
     @onToggleDimFilter={{this.onToggleDimFilter}}
   />
 */

import { throttle } from '@ember/runloop';
import Component from '@ember/component';
import { computed, action } from '@ember/object';
import layout from '../templates/components/dimension-selector';

export const THROTTLE_TIME = 750; // milliseconds

const ANIMATIONS = {
  animation: 'animationend',
  OAnimation: 'oAnimationEnd',
  MozAnimation: 'animationend',
  WebkitAnimation: 'webkitAnimationEnd',
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
  @computed('request.tableMetadata')
  get allDimensions() {
    const { dimensions, timeDimensions } = this.request.tableMetadata;
    return [...dimensions, ...timeDimensions];
  }

  /*
   * @property {Object} selectedColumns - item -> boolean map to denote if item should be checked
   */
  @computed('request.dimensionColumns.[]')
  get selectedColumns() {
    return this.request.dimensionColumns.reduce((items, item) => {
      items[item.columnMetadata.id] = true;
      return items;
    }, {});
  }

  /*
   * @property {Object} dimensionsFiltered - dimension -> boolean mapping denoting presence of dimension
   *                                         in request filters
   */
  @computed('request.dimensionFilters.[]')
  get dimensionsFiltered() {
    return this.request.dimensionFilters.reduce((list, dimension) => {
      list[dimension.columnMetadata.id] = true;
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
    this.onAddDimension?.(item);
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
