/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@ember/component';
import layout from '../templates/components/add-series-trigger';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['btn', 'btn-add', 'add-series-trigger'],

  /**
   * @property {String} tagName
   */
  tagName: 'button'
});
