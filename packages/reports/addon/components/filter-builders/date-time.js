/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterBuilders::DateTime
 *       @requestFragment={{this.request.filters.firstObject}}
 *       @request={{this.request}}
 *   />
 */
import { A as arr } from '@ember/array';
import { computed, action } from '@ember/object';
import BaseFilterBuilderComponent from './base';
import Interval from 'navi-data/utils/classes/interval';
import Duration, { parseDuration } from 'navi-core/utils/classes/duration';
import { getFirstDayOfIsoDateTimePeriod } from 'navi-data/utils/date';
import moment from 'moment';

export const MONTHS_IN_QUARTER = 3;
export const OPERATORS = {
  current: 'current',
  lookback: 'inPast',
  since: 'since',
  dateRange: 'in',
  advanced: 'advanced'
};

export default class DateTimeFilterBuilder extends BaseFilterBuilderComponent {
  /**
   * @property {String} dateTimePeriodName - the date time period
   */
  @computed('request.{timeGrain,tableMetadata.timeGrains}')
  get dateTimePeriodName() {
    const { timeGrain, tableMetadata } = this.request;
    return tableMetadata.timeGrains.find(t => t.id === timeGrain).name;
  }

  /**
   * @override
   * @property {Array} supportedOperators - list of valid operators for a date-time filter
   */
  @computed('dateTimePeriodName')
  get supportedOperators() {
    return [
      {
        id: OPERATORS.current,
        name: `Current ${this.dateTimePeriodName}`,
        valuesComponent: 'filter-values/current-period'
      },
      {
        id: OPERATORS.lookback,
        name: 'In The Past',
        valuesComponent: 'filter-values/lookback-input'
      },
      {
        id: OPERATORS.since,
        name: 'Since',
        valuesComponent: 'filter-values/since-input'
      },
      {
        id: OPERATORS.dateRange,
        name: 'Between',
        valuesComponent: 'filter-values/date-range'
      },
      {
        id: OPERATORS.advanced,
        name: 'Advanced',
        valuesComponent: 'filter-values/advanced-interval-input'
      }
    ];
  }

  /**
   * @property {Object} requestFragment - interval fragment from request
   */
  requestFragment = undefined;

  /**
   * Finds the appropriate interval operator to modify an existing interval
   * @param {Interval} interval - the interval to choose an operator for
   * @returns {Object} the best supported operator for this interval
   */
  operatorForInterval(interval) {
    const { start, end } = interval.asStrings();

    const startDuration = parseDuration(start);
    let operatorId;
    if (start === 'current' && end === 'next') {
      operatorId = OPERATORS.current;
    } else if (
      startDuration != null &&
      ['day', 'week', 'month', 'year'].includes(startDuration[1]) &&
      end === 'current'
    ) {
      operatorId = OPERATORS.lookback;
    } else if (moment.isMoment(interval._start) && (end === 'current' || end === 'next')) {
      operatorId = OPERATORS.since;
    } else if (moment.isMoment(interval._start) && moment.isMoment(interval._end)) {
      operatorId = OPERATORS.dateRange;
    } else {
      operatorId = OPERATORS.advanced;
    }

    return this.supportedOperators.find(op => op.id === operatorId);
  }

  /**
   * Converts an Interval to a format suitable to the newOperator while retaining as much information as possible
   * e.g. (P7D/current, day, in) -> 2020-01-01/2020-01-08
   * @param {Interval} interval
   * @param {String} dateTimePeriod
   * @param {String} newOperator
   */
  intervalForOperator(interval, dateTimePeriod, newOperator) {
    const { start, end } = interval.asMomentsForTimePeriod(dateTimePeriod);

    if (newOperator === OPERATORS.current) {
      return Interval.parseFromStrings('current', 'next');
    } else if (newOperator === OPERATORS.lookback) {
      const isQuarter = dateTimePeriod === 'quarter';
      const isHour = dateTimePeriod === 'hour';
      const intervalDateTimePeriod = isQuarter ? 'month' : isHour ? 'day' : dateTimePeriod;

      let intervalValue;
      if (end.isSame(moment(getFirstDayOfIsoDateTimePeriod(moment(), dateTimePeriod)))) {
        // end is 'current', get lookback amount
        intervalValue = interval.diffForTimePeriod(intervalDateTimePeriod);
      } else {
        intervalValue = 1;
      }

      if (isQuarter) {
        // round to quarter
        const quarters = Math.max(Math.floor(intervalValue / MONTHS_IN_QUARTER), 1);
        intervalValue = quarters * MONTHS_IN_QUARTER;
      }

      const dateTimePeriodLabel = intervalDateTimePeriod[0].toUpperCase();
      return Interval.parseFromStrings(`P${intervalValue}${dateTimePeriodLabel}`, 'current');
    } else if (newOperator === OPERATORS.since) {
      return new Interval(start, 'current');
    } else if (newOperator === OPERATORS.dateRange) {
      return new Interval(start, end);
    } else if (newOperator === OPERATORS.advanced) {
      const intervalValue = interval.diffForTimePeriod('day');
      return new Interval(new Duration(`P${intervalValue}D`), end);
    }
  }

  /**
   * @property {Object} filter
   * @override
   */
  @computed('request.interval', 'dateTimePeriodName')
  get filter() {
    const interval = this.request.interval;

    return {
      subject: { name: `Date Time (${this.dateTimePeriodName})` },
      operator: this.operatorForInterval(interval).id,
      values: arr([interval])
    };
  }

  /**
   * @action setOperator
   * @param {Object} operatorObject - a value from supportedOperators that should become the filter's operator
   */
  @action
  setOperator(operatorObject) {
    const newOperator = operatorObject.id;
    const oldOperator = this.filter.operator;

    if (oldOperator === newOperator) {
      return;
    }

    const dateTimePeriod = this.request.timeGrain;
    const originalInterval = this.request.interval;

    const newInterval = this.intervalForOperator(originalInterval, dateTimePeriod, newOperator);
    const { start, end } = newInterval.asStrings();

    this.onUpdateFilter({
      operator: newOperator,
      values: arr([start, end])
    });
  }
}
