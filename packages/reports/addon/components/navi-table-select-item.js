/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage: {{navi-table-select-item
 *          option=option
 *        }}
 */

import Component from '@ember/component';
import layout from '../templates/components/navi-table-select-item';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName
   */
  tagName: 'span'
});
