/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 *
 * Usage:
 *  <NaviRequestColumnConfig::Base
 *    @column={{editingColumn}}
 *    @metadata={{visualization.metadata}}
 *    @onClose={{action "onClose"}}
 *    @onUpdateColumnName={{action "onUpdateColumnName"}}
 *  />
 */
import Component from '@ember/component';
import { layout as templateLayout, classNames, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/navi-request-column-config/base';

@classNames('navi-request-column-config')
@tagName('div')
@templateLayout(layout)
class Base extends Component {}

export default Base;
