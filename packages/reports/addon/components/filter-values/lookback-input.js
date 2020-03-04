/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::LookbackInput
 *       @filter={{filter}}
 *       @request={{request}}
 *       @onUpdateFilter={{action "update"}}
 *   />
 */
import BaseIntervalComponent from './base-interval-component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/filter-values/lookback-input';
import { computed, get, action } from '@ember/object';
import Duration from 'navi-core/utils/classes/duration';
import Interval from 'navi-core/utils/classes/interval';
import { isEmpty } from '@ember/utils';
import { MONTHS_IN_QUARTER } from '../filter-builders/date-time';
import config from 'ember-get-config';
import { warn } from '@ember/debug';
import { capitalize } from '@ember/string';

@templateLayout(layout)
@tagName('')
class LookbackInput extends BaseIntervalComponent {
  /**
   * @property {Number} lookback - The number of `dateTimePeriod`s to look back by
   */
  @computed('interval', 'dateTimePeriod')
  get lookback() {
    const duration = get(this.interval, '_start');
    const lookback = duration.getValue();
    if (this.dateTimePeriod === 'quarter') {
      return lookback / MONTHS_IN_QUARTER;
    }
    return lookback;
  }

  /**
   * Build the relative interval string
   * @param {Number} amount - the number to look back
   * @param {String} dateTimePeriod - the time grain size to look back by
   * @returns {Duration}
   */
  lookbackToDuration(amount, dateTimePeriod) {
    if (dateTimePeriod === 'quarter') {
      amount = amount * MONTHS_IN_QUARTER;
      dateTimePeriod = 'month';
    }
    if (dateTimePeriod === 'hour') {
      dateTimePeriod = 'day';
    }
    return new Duration(`P${amount}${dateTimePeriod[0].toUpperCase()}`);
  }

  /**
   * @property {Array} ranges - list of ranges based on time grain supported look backs
   */
  @computed('dateTimePeriod', 'interval')
  get ranges() {
    const { dateTimePeriod } = this;
    const predefinedRanges = get(config, `navi.predefinedIntervalRanges.${dateTimePeriod}`) || [];

    return predefinedRanges
      .map(lookBack => {
        if (lookBack === 'current/next') {
          warn('current/next is not supported as a predefined lookback interval', {
            id: 'no-current-next-predefined-interval'
          });
          return undefined;
        }
        const duration = new Duration(lookBack);
        const interval = new Interval(duration, 'current');
        return {
          isActive: interval.isEqual(this.interval),
          interval,
          text: this.formatDurationFromCurrent(duration, dateTimePeriod)
        };
      })
      .filter(i => !!i);
  }

  @computed('calendarDateTimePeriod', 'lookback', 'dateRange')
  get dateDescription() {
    const { calendarDateTimePeriod, dateRange, lookback } = this;
    let datePeriod = calendarDateTimePeriod;
    if (datePeriod === 'hour') {
      datePeriod = 'day';
    }
    return `${datePeriod}${lookback === 1 ? '' : 's'} (${dateRange})`;
  }

  /**
   * Converts a duration into string representing how long ago duration is from today
   *
   * @method formatDurationFromCurrent
   * @param {Duration} duration - object to format
   * @param {String} timePeriod - time period dates should align to
   * @returns {String} formatted string
   */
  formatDurationFromCurrent(duration, timePeriod) {
    let durationValue = duration.getValue();
    let durationUnit = duration.getUnit();

    if (timePeriod === 'quarter') {
      durationValue = durationValue / MONTHS_IN_QUARTER;
      durationUnit = 'quarter';
    }

    if (durationValue === 1) {
      return `1 ${capitalize(durationUnit)}`;
    }

    return `${durationValue} ${capitalize(durationUnit)}s`;
  }

  /**
   * @action setLookback
   * @param {InputEvent} event - new interval to set in filter
   */
  @action
  setLookback({ target: { value } }) {
    if (isEmpty(value) || Number(value) < 1) {
      return;
    }
    const lookbackDuration = this.lookbackToDuration(value, this.dateTimePeriod);
    return this.setInterval(lookbackDuration, 'current');
  }

  /**
   * Sets an interval exactly as it was defined (does not make it inclusive)
   * @action
   * @method setPresetInterval
   * @param {Interval} interval - The exact interval to set
   * @returns {Interval} - the interval that was set
   */
  @action
  setPresetInterval(interval) {
    return this.setInterval(interval._start, interval._end, false);
  }
}

export default LookbackInput;
