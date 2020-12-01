/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action, computed } from '@ember/object';
import moment, { Moment } from 'moment';
import BaseTimeDimensionFilter from './base';

export default class DateComponent extends BaseTimeDimensionFilter {
  @computed('args.filter.values.[]')
  get date(): Moment | undefined {
    const [date] = this.args.filter.values;
    if (date) {
      return moment.utc(date);
    }
    return undefined;
  }

  @action
  setDate(date: Moment) {
    this.setTimeValues([date.toISOString()]);
  }
}
