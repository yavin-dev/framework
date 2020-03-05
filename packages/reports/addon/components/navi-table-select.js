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
 *        />
 */

import Component from '@ember/component';
import layout from '../templates/components/navi-table-select';

class NaviTableSelectComponent extends Component {
  layout = layout;
  tagName = '';

  /**
   * @property {Boolean} searchEnabled
   */
  searchEnabled = false;

  /**
   * @property {String} searchField
   */
  searchField = 'name';
}

export default NaviTableSelectComponent;
