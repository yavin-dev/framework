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

export default class extends Base {
  /**
   * @override
   * @property {Array} supportedOperators - list of valid operators for a date-time filter
   */
  @computed()
  get supportedOperators() {
    return [
      {
        id: 'in',
        longName: 'In Range',
        valuesComponent: 'filter-values/date-range'
      },
      {
        id: 'inPast',
        longName: 'In The Past',
        valuesComponent: 'filter-values/lookback-input'
      }
    ];
  }

  /**
   * @property {Object} requestFragment - interval fragment from request
   */
  requestFragment = undefined;

  /**
   * @property {Object} filter
   * @override
   */
  @computed('requestFragment.interval', 'request.logicalTable.timeGrain')
  get filter() {
    const interval = get(this, 'requestFragment.interval'),
      timeGrainName = get(this, 'request.logicalTable.timeGrain.longName'),
      longName = `Date Time (${timeGrainName})`;

    let operator;

    const { start, end } = interval.asStrings();
    if (start.startsWith('P') && end === 'current') {
      operator = get(this, 'supportedOperators')[1];
    } else {
      operator = get(this, 'supportedOperators')[0];
    }

    return {
      subject: { longName },
      operator,
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

    if (newOperator === 'inPast') {
      const interval = get(this, 'requestFragment.interval');
      const timeGrain = get(this, 'request.logicalTable.timeGrain.longName').toLowerCase();

      const isQuarter = timeGrain === 'quarter';
      const diffGrain = isQuarter ? 'month' : timeGrain;

      // todo only use this if the end is aligned to latest grain
      // else fall back to default of P1G
      let intervalValue = interval.diffForTimePeriod(diffGrain);
      if (isQuarter) {
        // round to quarter
        const quarters = Math.max(Math.floor(intervalValue / 3), 1);
        intervalValue = quarters * 3;
      }
      const start = `P${intervalValue}${diffGrain[0].toUpperCase()}`;
      set(this, 'requestFragment.interval', Interval.parseFromStrings(start, 'current'));
    } else if (newOperator === 'in') {
      const { start, end } = get(this, 'requestFragment.interval').asMoments();
      const exactInterval = new Interval(start, end);

      set(this, 'requestFragment.interval', exactInterval);
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
