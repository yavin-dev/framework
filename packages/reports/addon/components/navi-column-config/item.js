/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 *
 * Usage:
 *  <NaviRequestColumnConfig::Item
 *    @column={{this.column}}
 *    @onRemoveColumn={{fn this.removeColumn this.column}}
 *  />
 */
import Component from '@ember/component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/navi-column-config/item';

@tagName('')
@templateLayout(layout)
class NaviColumnConfigItemComponent extends Component {}

export default NaviColumnConfigItemComponent;
