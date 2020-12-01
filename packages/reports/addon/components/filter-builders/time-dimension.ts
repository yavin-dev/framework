/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import { assert, warn } from '@ember/debug';
import { action, computed } from '@ember/object';
import { capitalize } from '@ember/string';
import moment from 'moment';
import FilterFragment from 'navi-core/addon/models/bard-request-v2/fragments/filter';
import { parseDuration } from 'navi-data/utils/classes/duration';
import { getFirstDayOfGrain, getPeriodForGrain, Grain } from 'navi-data/utils/date';
import Interval from 'navi-data/utils/classes/interval';
import BaseFilterBuilderComponent, { FilterBuilderOperators } from './base';

export const MONTHS_IN_QUARTER = 3;
export const OPERATORS = <const>{
  current: 'current',
  lookback: 'inPast',
  since: 'since',
  before: 'before',
  dateRange: 'in'
};
type InternalOperatorType = typeof OPERATORS[keyof typeof OPERATORS];

interface InteralFilterBuilderOperators extends FilterBuilderOperators {
  internalId: InternalOperatorType;
}

type TimeFilterValues = [string, string] | [string] | [];

type TimeDimensionFilterArgs = BaseFilterBuilderComponent['args'] & {
  filter: FilterFragment & { values: string[] };
};

/**
 * Converts a grain into a period usable for the interval class
 * @param grain - the grain to turn into a period
 */
function intervalPeriodForGrain(grain: Grain) {
  if (grain === 'quarter') {
    return 'month';
  } else if (grain === 'hour') {
    return 'day';
  }
  return getPeriodForGrain(grain);
}

export default class TimeDimensionFilterBuilder extends BaseFilterBuilderComponent<TimeDimensionFilterArgs> {
  @computed('args.filter.parameters.grain')
  get timeGrainName() {
    return capitalize(this.args.filter.parameters.grain);
  }

  /**
   * list of valid operators for a date-time filter
   */
  @computed('args.filter.parameters.grain', 'timeGrainName')
  get supportedOperators(): InteralFilterBuilderOperators[] {
    return [
      {
        id: 'bet' as const,
        internalId: OPERATORS.current,
        name: `Current ${this.timeGrainName}`,
        valuesComponent: 'filter-values/time-dimension/current'
      },
      {
        id: 'bet' as const,
        internalId: OPERATORS.lookback,
        name: 'In The Past',
        valuesComponent: 'filter-values/time-dimension/lookback'
      },
      {
        id: 'gte' as const,
        internalId: OPERATORS.since,
        name: 'Since',
        valuesComponent: 'filter-values/time-dimension/date'
      },
      {
        id: 'lte' as const,
        internalId: OPERATORS.before,
        name: 'Before',
        valuesComponent: 'filter-values/time-dimension/date'
      },
      {
        id: 'bet' as const,
        internalId: OPERATORS.dateRange,
        name: 'Between',
        valuesComponent: 'filter-values/time-dimension/range'
      }
    ];
  }

  /**
   * Converts an Interval to a format suitable to the newOperator while retaining as much information as possible
   * e.g. ([P7D, current], day, in) -> [2020-01-01,2020-01-08]
   * @param prevValues - the previous filter values
   * @param dateTimePeriod - the time period being requested
   * @param newOperator - the operator to build values for
   */
  valuesForOperator(prevValues: TimeFilterValues, dateTimePeriod: Grain, newOperator: InternalOperatorType) {
    const startStr = prevValues[0] || 'P1D';
    let endStr = prevValues[1];
    if (!endStr) {
      endStr = 'current';
    }

    if (newOperator === OPERATORS.current) {
      return ['current', 'next'];
    } else if (newOperator === OPERATORS.lookback) {
      const interval = Interval.parseFromStrings(startStr, endStr);
      const end = interval.asMomentsForTimePeriod(dateTimePeriod).end.utc(true);
      let intervalTimePeriod = intervalPeriodForGrain(dateTimePeriod);
      const nonAllGrain = dateTimePeriod === 'all' ? 'day' : dateTimePeriod;

      let intervalValue;
      if (end.isSame(moment.utc(getFirstDayOfGrain(moment.utc(), nonAllGrain)))) {
        // end is 'current', get lookback amount
        intervalValue = interval.diffForTimePeriod(intervalTimePeriod);
      } else {
        intervalValue = 1;
      }

      if (dateTimePeriod === 'quarter') {
        // round to quarter
        const quarters = Math.max(Math.floor(intervalValue / MONTHS_IN_QUARTER), 1);
        intervalValue = quarters * MONTHS_IN_QUARTER;
      }

      const dateTimePeriodLabel = intervalTimePeriod[0].toUpperCase();
      return [`P${intervalValue}${dateTimePeriodLabel}`, 'current'];
    } else if (newOperator === OPERATORS.since) {
      const interval = Interval.parseFromStrings(startStr, endStr);
      const { start } = interval.asMomentsForTimePeriod(dateTimePeriod);
      return [start.utc(true).toISOString()];
    } else if (newOperator === OPERATORS.before) {
      const interval = Interval.parseFromStrings(startStr, endStr);
      const { end } = interval.asMomentsForTimePeriod(dateTimePeriod);
      return [
        end
          .utc(true)
          .subtract(1, getPeriodForGrain(dateTimePeriod))
          .toISOString()
      ];
    } else if (newOperator === OPERATORS.dateRange) {
      const interval = Interval.parseFromStrings(startStr, endStr);
      const { start, end } = interval.asMomentsForTimePeriod(dateTimePeriod);
      return [start.utc(true).toISOString(), end.utc(true).toISOString()];
    }
    warn(`No operator was found for the values '${prevValues.join(',')}'`, {
      id: 'time-dimension-filter-builder-no-operator'
    });

    return [];
  }

  /**
   * Finds the appropriate interval operator to modify an existing interval
   * @param interval - the interval to choose an operator for
   * @returns the best supported operator for this interval
   */
  @computed('args.filter.{values,operator}', 'supportedOperators')
  get selectedOperator(): InteralFilterBuilderOperators {
    const { values, operator } = this.args.filter;
    const [startStr, endStr] = values;
    if (!(startStr && endStr)) {
      const filterValueBuilder = this.supportedOperators.find(({ id }) => id === operator);
      assert(`A filter value component for ${operator} operator exists`, filterValueBuilder);
      return filterValueBuilder;
    }
    const interval = Interval.parseFromStrings(startStr, endStr);
    const { start, end } = interval.asStrings();

    const [lookbackDuration, lookbackGrain] = parseDuration(start) || [];
    let operatorId: InternalOperatorType;
    if (start === 'current' && end === 'next') {
      operatorId = OPERATORS.current;
    } else if (
      lookbackDuration &&
      lookbackGrain &&
      ['day', 'week', 'month', 'year'].includes(lookbackGrain) &&
      end === 'current'
    ) {
      operatorId = OPERATORS.lookback;
    } else if (moment.isMoment(interval['_start']) && end === 'current') {
      operatorId = OPERATORS.since;
    } else if (moment.isMoment(interval['_start']) && moment.isMoment(interval['_end'])) {
      operatorId = OPERATORS.dateRange;
    } else {
      operatorId = OPERATORS.dateRange;
    }

    const filterValueBuilder = this.supportedOperators.find(({ internalId }) => internalId === operatorId);
    assert(`A filter value component for ${operator} operator exists`, filterValueBuilder);
    return filterValueBuilder;
  }

  /**
   * @param operator - a value from supportedOperators that should become the filter's operator
   */
  @action
  setOperator(operator: InteralFilterBuilderOperators) {
    const oldOperator = this.selectedOperator;

    if (oldOperator.internalId === operator.internalId) {
      return;
    }

    const {
      parameters: { grain },
      values
    } = this.args.filter;

    const newInterval = this.valuesForOperator(values as TimeFilterValues, grain as Grain, operator.internalId);

    this.args.onUpdateFilter({
      operator: operator.id,
      values: arr(newInterval)
    });
  }
}
