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
import type { Moment } from 'moment';
import type { Grain } from 'navi-data/utils/date';

type Args = {
  date: Moment;
  dateTimePeriod: Grain;
  onUpdate: (date: Moment) => void;
};

export default class DropdownDatePicker extends Component<Args> {}
