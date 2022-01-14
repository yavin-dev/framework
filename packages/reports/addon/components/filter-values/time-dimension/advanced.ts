/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseIntervalComponent from './base-interval';
import { PARAM_DATE_FORMAT_STRING } from 'navi-data/utils/date';
import moment from 'moment';
import Interval from 'navi-data/utils/classes/interval';

export default class FilterValuesTimeDimensionAdvanced extends BaseIntervalComponent {
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

  get dateStrings() {
    const [start, end] = this.args.filter.values;
    return {
      start: this.formatValue(start),
      end: this.formatValue(end),
    };
  }

  get isIntervalValid() {
    return this.args.filter.validations.isValid;
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
}
