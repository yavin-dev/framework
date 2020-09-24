/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Interval from 'navi-data/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import moment from 'moment';

export default {
  second: 'P1D',
  minute: 'P1D',
  hour: 'P1D',
  day: 'P1D',
  week: 'P1W',
  month: 'P1M',
  quarter: 'P3M',
  year: 'P1Y',
  all: 'P7D',

  /**
   * @method getDefault
   * @param {String} timeGrain - name of time grain
   * @returns {Interval} default interval for given time grain
   */
  getDefault(timeGrain) {
    // All timegrain doesn't support `current` macro
    let intervalEnd = 'current';
    if (timeGrain === 'all') {
      intervalEnd = moment().startOf('day');
    }

    return new Interval(new Duration(this[timeGrain]), intervalEnd);
  }
};
