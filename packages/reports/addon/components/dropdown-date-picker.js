/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <DropdownDatePicker
 *       @onUpdate={{action this.onUpdate}}
 *       @date={{moment this.savedDate}}
 *       @dateTimePeriod="day"
 *   />
 */
import Component from '@ember/component';
import layout from '../templates/components/dropdown-date-picker';
import { layout as templateLayout } from '@ember-decorators/component';

@templateLayout(layout)
class DropdownDatePicker extends Component {}

export default DropdownDatePicker;
