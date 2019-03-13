/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember Collection Layout for items with multiple heights
 * and 100% width
 */

import { helper as buildHelper } from '@ember/component/helper';
import { formatPercentageStyle } from 'ember-collection/utils/style-generators';
import ShelfFirst from 'layout-bin-packer/shelf-first';

/**
 * @constant {Number} MOCK_WIDTH - mock width needed for bin packer
 */
const MOCK_WIDTH = 100;

class MixedHeightLayout {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.bin = new ShelfFirst(dimensions, MOCK_WIDTH);
  }

  contentSize(clientWidth /*, clientHeight*/) {
    let size = {
      width: clientWidth,
      height: this.bin.height(MOCK_WIDTH)
    };
    return size;
  }

  indexAt(offsetX, offsetY, width, height) {
    return this.bin.visibleStartingIndex(offsetY, MOCK_WIDTH, height);
  }

  positionAt(index, width, height) {
    return this.bin.position(index, MOCK_WIDTH, height);
  }

  heightAt(index) {
    return this.bin.heightAtIndex(index);
  }

  count(offsetX, offsetY, width, height) {
    return this.bin.numberVisibleWithin(offsetY, MOCK_WIDTH, height, true);
  }

  formatItemStyle(itemIndex, clientWidth, clientHeight) {
    let pos = this.positionAt(itemIndex, MOCK_WIDTH, clientHeight);
    let height = this.heightAt(itemIndex, MOCK_WIDTH, clientHeight);
    return formatPercentageStyle({ x: 0, y: pos.y }, 100, height);
  }
}

/**
 * Method for generating dimension object used in MixedHeightLayout
 *
 * @function formatItemDimension
 * @param {Number} height - height in pixels
 * @returns {Object} dimension object
 */
export function formatItemDimension(height) {
  return {
    height,
    width: MOCK_WIDTH
  };
}

export default buildHelper(function(params /*, hash */) {
  return new MixedHeightLayout(params[0]);
});
