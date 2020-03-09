/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config DateTime Component
 *
 * Usage:
 *  <NaviColumnConfig::DateTime
 *    @column={{editingColumn}}
 *    @metadata={{visualization.metadata}}
 *    @onClose={{action "onClose"}}
 *    @onUpdateColumnName={{action "onUpdateColumnName"}}
 *  />
 */
import Component from '@ember/component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/navi-column-config/date-time';

@tagName('')
@templateLayout(layout)
class DateTime extends Component {}

export default DateTime;
