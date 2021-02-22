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
import BaseIntervalComponent from './base-interval';
import { computed, action } from '@ember/object';
import Duration from 'navi-data/utils/classes/duration';
import Interval from 'navi-data/utils/classes/interval';
import { isEmpty } from '@ember/utils';
import { intervalPeriodForGrain, MONTHS_IN_QUARTER } from '../../filter-builders/time-dimension';
import config from 'ember-get-config';
import { capitalize } from '@ember/string';
import { Grain } from 'navi-data/utils/date';

export default class LookbackInput extends BaseIntervalComponent {
  /**
   * @property {Number} lookback - The number of `dateTimePeriod`s to look back by
   */
  @computed('interval', 'dateTimePeriod')
  get lookback() {
    const { interval, dateTimePeriod } = this;
    const { start } = interval?.asStrings() || {};
    if (start) {
      const duration = new Duration(start);
      const lookback = duration.getValue();
      if (dateTimePeriod === 'quarter' && typeof lookback === 'number') {
        return lookback / MONTHS_IN_QUARTER;
      }
      return lookback;
    }
    return 0;
  }

  /**
   * Build the relative interval string
   * @param amount - the number to look back
   * @param dateTimePeriod - the time grain size to look back by
   */
  lookbackToDuration(amount: number, dateTimePeriod: Grain): string {
    if (dateTimePeriod === 'quarter') {
      amount = amount * MONTHS_IN_QUARTER;
    }
    const period = intervalPeriodForGrain(dateTimePeriod);
    return `P${amount}${period[0].toUpperCase()}`;
  }

  /**
   * list of ranges based on time grain supported look backs
   */
  @computed('dateTimePeriod', 'interval')
  get ranges() {
    const { dateTimePeriod } = this;
    const predefinedRanges = config.navi.predefinedIntervalRanges[dateTimePeriod] || [];

    return predefinedRanges.map((lookBack) => {
      const duration = new Duration(lookBack);
      const interval = new Interval(duration, 'current');
      return {
        isActive: interval.isEqual(this.interval),
        interval,
        text: this.formatDurationFromCurrent(duration, dateTimePeriod),
      };
    });
  }

  /**
   * human readable representation of the interval represented
   */
  @computed('calendarDateTimePeriod', 'lookback', 'dateRange')
  get dateDescription(): string {
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
   * @param duration - object to format
   * @param timePeriod - time period dates should align to
   * @returns formatted string
   */
  formatDurationFromCurrent(duration: Duration, timePeriod: Grain) {
    let durationValue = duration.getValue();
    let durationUnit: string = duration.getUnit() || '';

    if (timePeriod === 'quarter' && typeof durationValue === 'number') {
      durationValue = durationValue / MONTHS_IN_QUARTER;
      durationUnit = 'quarter';
    }

    return `${durationValue} ${capitalize(durationUnit)}${durationValue > 1 ? 's' : ''}`;
  }

  /**
   * No op search matcher
   */
  @action
  noop() {
    return null;
  }

  /**
   * @param event - new interval to set in filter
   */
  @action
  setLookback({ target: { value } }: { target: HTMLInputElement }) {
    const lookback = Number(value);
    if (isEmpty(value) || lookback < 1) {
      return;
    }
    const lookbackDuration = this.lookbackToDuration(lookback, this.dateTimePeriod);
    return this.setTimeStart(lookbackDuration);
  }

  /**
   * Sets an interval exactly as it was defined (does not make it inclusive)
   *
   * @param interval - The exact interval to set
   * @returns - the interval that was set
   */
  @action
  setPresetInterval(interval: Interval) {
    const { start, end } = interval.asStrings();
    return this.setTimeValues([start, end]);
  }
}
