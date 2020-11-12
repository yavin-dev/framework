/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseDateSelector from './base-date';
import { readOnly } from '@ember/object/computed';
import { action } from '@ember/object';
import moment from 'moment';

export default class DateComponent extends BaseDateSelector {
  @readOnly('args.filter.values.0')
  date?: string;

  @action
  setDate(date: string) {
    this.args.onUpdateFilter({
      values: [moment(date).format('YYYY-MM-DD')]
    });
  }
}
