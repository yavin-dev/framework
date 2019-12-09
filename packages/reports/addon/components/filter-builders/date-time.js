/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/date-time
 *       requestFragment=request.filters.firstObject
 *       request=request
 *   }}
 */
import { A as arr } from '@ember/array';
import { get, set, computed, action } from '@ember/object';
import Base from './base';
import Interval from 'navi-core/utils/classes/interval';
import { getFirstDayOfIsoDateTimePeriod } from 'navi-core/utils/date';
import moment from 'moment';

export default class extends Base {
  @computed('request.logicalTable.timeGrain')
  get timeGrainName() {
    return get(this, 'request.logicalTable.timeGrain.longName');
  }

  /**
   * @override
   * @property {Array} supportedOperators - list of valid operators for a date-time filter
   */
  @computed('timeGrainName')
  get supportedOperators() {
    return [
      {
        id: 'current',
        longName: `Current ${this.timeGrainName}`,
        valuesComponent: null // TODO: show range
      },
      {
        id: 'inPast',
        longName: 'In The Past',
        valuesComponent: 'filter-values/lookback-input'
      },
      {
        id: 'since',
        longName: 'Since',
        valuesComponent: null // TODO: Show dropdown date picker, include current?, and range
      },
      {
        id: 'in',
        longName: 'Between',
        valuesComponent: 'filter-values/date-range'
      },
      {
        id: 'advanced',
        longName: 'Advanced',
        valuesComponent: null // TODO: Show two inputs and range
      }
    ];
  }

  /**
   * @property {Object} requestFragment - interval fragment from request
   */
  requestFragment = undefined;

  intervalOperator(interval) {
    const { start, end } = interval.asStrings();

    let operatorId;
    if (start === 'current' && end === 'next') {
      operatorId = 'current';
    } else if (start.startsWith('P') && end === 'current') {
      operatorId = 'inPast';
    } else if (moment.isMoment(interval._start) && (end === 'current' || end === 'next')) {
      operatorId = 'since';
    } else if (moment.isMoment(interval._start) && moment.isMoment(interval._end)) {
      operatorId = 'in';
    } else {
      operatorId = 'advanced';
    }

    return get(this, 'supportedOperators').find(op => op.id === operatorId);
  }

  /**
   * @property {Object} filter
   * @override
   */
  @computed('requestFragment.interval', 'timeGrainName')
  get filter() {
    const interval = get(this, 'requestFragment.interval');

    return {
      subject: { longName: `Date Time (${this.timeGrainName})` },
      operator: this.intervalOperator(interval),
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
    let { start, end } = originalInterval.asMomentsForTimePeriod(timeGrain);
    if (newOperator === 'current') {
      set(this, 'requestFragment.interval', Interval.parseFromStrings('current', 'next'));
    } else if (newOperator === 'inPast') {
      const isQuarter = timeGrain === 'quarter';
      const diffGrain = isQuarter ? 'month' : timeGrain;

      let intervalValue;
      if (end.isSame(moment(getFirstDayOfIsoDateTimePeriod(moment(), timeGrain)))) {
        // end is 'current', get lookback amount
        intervalValue = originalInterval.diffForTimePeriod(diffGrain);
      } else {
        intervalValue = 1;
      }

      if (isQuarter) {
        // round to quarter
        const quarters = Math.max(Math.floor(intervalValue / 3), 1);
        intervalValue = quarters * 3;
      }

      const grainLabel = diffGrain[0].toUpperCase();
      const start = `P${intervalValue}${grainLabel}`;
      set(this, 'requestFragment.interval', Interval.parseFromStrings(start, 'current'));
    } else if (newOperator === 'in') {
      set(this, 'requestFragment.interval', new Interval(start, end));
    }

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
