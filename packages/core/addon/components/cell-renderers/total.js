/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@ember/component';
import layout from '../../templates/components/cell-renderers/total';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['table-cell--total', 'table-cell-content']
});
