/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { readOnly } from '@ember/object/computed';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import Moment from 'moment';
import Args from './args-interface';

export default class DateComponent extends Component<Args> {
  @readOnly('args.filter.values.0')
  date?: string;

  @action
  setDate(date: string) {
    this.args.onUpdateFilter({
      values: [Moment(date).format('YYYY-MM-DD')]
    });
  }
}
