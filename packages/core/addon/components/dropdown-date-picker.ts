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
import Component from '@glimmer/component';
import { Moment } from 'moment';

type Args = {
  date: Moment;
  dateTimePeriod: string;
  onUpdate: Function;
};

class DropdownDatePicker extends Component<Args> {}

export default DropdownDatePicker;
