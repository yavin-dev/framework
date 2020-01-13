/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterBuilders::DateTime
 *       @requestFragment={{request.filters.firstObject}}
 *       @request={{request}}
 *   />
 */
import { A as arr } from '@ember/array';
import { get, set, computed, action } from '@ember/object';
import Base from './base';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import { getFirstDayOfIsoDateTimePeriod } from 'navi-core/utils/date';
import moment from 'moment';

export default class extends Base {
  /**
   * @property {String} dateTimePeriodName - the date time period
   */
  @computed('request.logicalTable.timeGrain')
  get dateTimePeriodName() {
    return get(this, 'request.logicalTable.timeGrain.longName');
  }

  /**
   * @override
   * @property {Array} supportedOperators - list of valid operators for a date-time filter
   */
  @computed('dateTimePeriodName')
  get supportedOperators() {
    return [
      {
        id: 'current',
        longName: `Current ${this.dateTimePeriodName}`,
        valuesComponent: 'filter-values/current-period'
      },
      {
        id: 'inPast',
        longName: 'In The Past',
        valuesComponent: 'filter-values/lookback-input'
      },
      {
        id: 'since',
        longName: 'Since',
        valuesComponent: 'filter-values/since-input'
      },
      {
        id: 'in',
        longName: 'Between',
        valuesComponent: 'filter-values/date-range'
      },
      {
        id: 'advanced',
        longName: 'Advanced',
        valuesComponent: 'filter-values/advanced-interval-input' // TODO: Show two inputs and range
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
   */
  operatorForInterval(interval) {
    const { start, end } = interval.asStrings();

    const [, /*match*/ lookback /*amount*/, , dateTimePeriodLabel] = /(P)(\d+)(\w)/.exec(start) || [];
    let operatorId;
    if (start === 'current' && end === 'next') {
      operatorId = 'current';
    } else if (lookback === 'P' && ['D', 'W', 'M', 'Y'].includes(dateTimePeriodLabel) && end === 'current') {
      operatorId = 'inPast';
    } else if (moment.isMoment(interval._start) && (end === 'current' || end === 'next')) {
      operatorId = 'since';
    } else if (moment.isMoment(interval._start) && moment.isMoment(interval._end)) {
      operatorId = 'in';
    } else {
      operatorId = 'advanced';
    }

    return this.supportedOperators.find(op => op.id === operatorId);
  }

  /**
   *
   * @param {Interval} interval
   * @param {String} newOperator
   */
  convertIntervalToOperator(interval, dateTimePeriod, newOperator) {
    const { start, end } = interval.asMomentsForTimePeriod(dateTimePeriod);

    if (newOperator === 'current') {
      return Interval.parseFromStrings('current', 'next');
    } else if (newOperator === 'inPast') {
      const isQuarter = dateTimePeriod === 'quarter';
      const intervalDateTimePeriod = isQuarter ? 'month' : dateTimePeriod;

      let intervalValue;
      if (end.isSame(moment(getFirstDayOfIsoDateTimePeriod(moment(), dateTimePeriod)))) {
        // end is 'current', get lookback amount
        intervalValue = interval.diffForTimePeriod(intervalDateTimePeriod);
      } else {
        intervalValue = 1;
      }

      if (isQuarter) {
        // round to quarter
        const quarters = Math.max(Math.floor(intervalValue / 3), 1);
        intervalValue = quarters * 3;
      }

      const dateTimePeriodLabel = intervalDateTimePeriod[0].toUpperCase();
      return Interval.parseFromStrings(`P${intervalValue}${dateTimePeriodLabel}`, 'current');
    } else if (newOperator === 'since') {
      return new Interval(start, 'current');
    } else if (newOperator === 'in') {
      return new Interval(start, end);
    } else if (newOperator === 'advanced') {
      const intervalValue = interval.diffForTimePeriod('day');
      return new Interval(new Duration(`P${intervalValue}D`), end);
    }
  }

  /**
   * @property {Object} filter
   * @override
   */
  @computed('requestFragment.interval', 'dateTimePeriodName')
  get filter() {
    const interval = get(this, 'requestFragment.interval');

    return {
      subject: { longName: `Date Time (${this.dateTimePeriodName})` },
      operator: this.operatorForInterval(interval),
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
    const oldOperator = this.filter.operator.id;

    if (oldOperator === newOperator) {
      return;
    }

    let changeSet = { operator: newOperator };

    const timeGrain = get(this, 'request.logicalTable.timeGrain.name');
    const originalInterval = get(this, 'requestFragment.interval');
    const newInterval = this.convertIntervalToOperator(originalInterval, timeGrain, newOperator);
    set(this, 'requestFragment.interval', newInterval);

    Object.assign(changeSet, {
      values: arr([get(this, 'requestFragment.interval')])
    });

    //switch field to primary key if operator does not allow choosing fields
    if (get(this, 'primaryKeyField') && !operatorObject.showFields) {
      Object.assign(changeSet, { field: get(this, 'primaryKeyField') });
    }

    this.onUpdateFilter(changeSet);
  }
}
