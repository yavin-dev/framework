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
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../templates/components/navi-table-select';

@templateLayout(layout)
@tagName('')
class NaviTableSelectComponent extends Component {
  /**
   * @property {Boolean} searchEnabled
   */
  searchEnabled = false;

  /**
   * @property {String} searchField
   */
  searchField = 'longName';
}

export default NaviTableSelectComponent;
