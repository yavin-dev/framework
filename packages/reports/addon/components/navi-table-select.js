/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage: {{navi-table-select
 *          options=options
 *          selected=selected
 *          onChange=onChange
 *          searchEnabled=searchEnabled
 *          tagName=tagName
 *        }}
 */

import Component from '@ember/component';
import layout from '../templates/components/navi-table-select';

export default Component.extend({
  layout,

  classNames: ['navi-table-select'],

  /**
   * @property {Boolean} searchEnabled
   */
  searchEnabled: false
});
