/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage: <NaviTableSelect
 *          @options={{options}}
 *          @selected={{selected}}
 *          @onChange={{onChange}}
 *          @searchEnabled={{searchEnabled}}
 *          @searchField={{searchField}}
 *          @tagName={{tagName}}
 *        />
 */

import Component from '@ember/component';
import layout from '../templates/components/navi-table-select';

export default class NaviTableSelect extends Component {
  layout = layout;

  /**
   * @property {Array} classNames
   */
  classNames = ['navi-table-select'];

  /**
   * @property {Boolean} searchEnabled
   */
  searchEnabled = false;

  /**
   * @property {String} searchField
   */
  searchField = 'longName';
}
