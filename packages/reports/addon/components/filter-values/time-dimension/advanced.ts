/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseIntervalComponent from './base-interval';
import { PARAM_DATE_FORMAT_STRING } from 'navi-data/utils/date';
import moment from 'moment';
import Interval from 'navi-data/utils/classes/interval';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isIntervalValid } from 'navi-core/models/request/filter';

export default class FilterValuesTimeDimensionAdvanced extends BaseIntervalComponent {
  @tracked start = this.formatValue(this.args.filter.values[0]);
  @tracked end = this.formatValue(this.args.filter.values[1]);

  formatValue(date: string) {
    if (typeof date === 'string') {
      try {
        const property = Interval.fromString(date);
        return Interval._stringFromProperty(property, PARAM_DATE_FORMAT_STRING);
      } catch (e) {
        // invalid value
      }
    }
    return date;
  }

  get newValues() {
    return [this.parseDate(this.start), this.parseDate(this.end)];
  }

  get isIntervalValid() {
    return isIntervalValid(this.newValues, this.args.filter);
  }

  /**
   * Parses date string from the input fields
   *
   * @param date - date string input event
   * @returns iso string or current value
   */
  parseDate(date: string) {
    const momentDate = moment.parseZone(date);
    return momentDate.isValid() ? momentDate.toISOString() : date;
  }

  @action
  commitValues() {
    this.args.onUpdateFilter({ values: this.newValues });
  }
}
