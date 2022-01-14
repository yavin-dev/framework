/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import { assert, warn } from '@ember/debug';
import { action, computed } from '@ember/object';
import { capitalize } from '@ember/string';
import moment from 'moment';
import FilterFragment from 'navi-core/models/request/filter';
import { parseDuration } from 'navi-data/utils/classes/duration';
import { DateTimePeriod, getPeriodForGrain, Grain } from 'navi-data/utils/date';
import Interval from 'navi-data/utils/classes/interval';
import BaseFilterBuilderComponent, { FilterValueBuilder } from './base';
import { isEmpty } from '@ember/utils';

export const MONTHS_IN_QUARTER = 3;
export const OPERATORS = <const>{
  current: 'current',
  lookback: 'inPast',
  since: 'since',
  before: 'before',
  dateRange: 'in',
  advanced: 'advanced',
};
type InternalOperatorType = typeof OPERATORS[keyof typeof OPERATORS];

interface InteralFilterBuilderOperators extends FilterValueBuilder {
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
type DateGrain = Exclude<DateTimePeriod, 'second' | 'minute' | 'hour'>;
export function intervalPeriodForGrain(grain: Grain): DateGrain {
  if (grain === 'quarter') {
    return 'month';
  }

  let period = getPeriodForGrain(grain);
  if (period === 'hour' || period === 'minute' || period === 'second') {
    period = 'day';
  }

  return period;
}

type FilterLike = Pick<FilterFragment, 'values' | 'parameters' | 'operator'>;

/**
 * Converts an Interval to a format suitable to the newOperator while retaining as much information as possible
 * e.g. ([P7D, current], day, in) -> [2020-01-01,2020-01-08]
 * @param prevValues - the previous filter values
 * @param grain - the time period being requested
 * @param newOperator - the operator to build values for
 */
export function valuesForOperator(
  filter: FilterLike,
  grain: Grain,
  newOperator?: InternalOperatorType
): TimeFilterValues {
  // TODO: Support sub day grain
  if (grain === 'hour' || grain === 'minute' || grain === 'second') {
    grain = 'day';
  }
  newOperator = newOperator || internalOperatorForValues(filter);
  let [startStr = 'P1D', endStr = 'current'] = filter.values as TimeFilterValues;
  if (isEmpty(startStr)) {
    startStr = 'P1D';
  }
  if (isEmpty(endStr)) {
    endStr = 'current';
  }

  const filterGrain = filter.parameters.grain as Grain;
  const interval = Interval.parseInclusive(startStr, endStr, filterGrain);

  if (newOperator === OPERATORS.current) {
    return ['current', 'next'];
  } else if (newOperator === OPERATORS.lookback) {
    const currentEnd = Interval.parseFromStrings('P1D', 'current').asMomentsForTimePeriod(grain, false).end;
    const end = interval.asMomentsForTimePeriod(grain).end;

    let intervalValue = 1;
    if (end.isSame(currentEnd)) {
      // end is 'current', get lookback amount
      intervalValue = interval.diffForTimePeriod(grain);
    }
    intervalValue = Math.max(intervalValue, 1);

    if (grain === 'quarter') {
      // round to quarter
      intervalValue = intervalValue * MONTHS_IN_QUARTER;
    }

    const grainLabel = intervalPeriodForGrain(grain)[0].toUpperCase();
    return [`P${intervalValue}${grainLabel}`, 'current'];
  } else if (newOperator === OPERATORS.since) {
    const { start } = interval.asMomentsInclusive(grain);
    return [start.toISOString()];
  } else if (newOperator === OPERATORS.before) {
    const { end } = interval.asMomentsInclusive(grain);
    return [end.toISOString()];
  } else if (newOperator === OPERATORS.dateRange) {
    const { start, end } = interval.asMomentsInclusive(grain);
    return [start.toISOString(), end.toISOString()];
  } else if (newOperator === OPERATORS.advanced) {
    const newInterval = interval.asIntervalForTimePeriod(grain);
    const intervalValue = Math.abs(newInterval.diffForTimePeriod('day'));
    const end = newInterval.asMomentsForTimePeriod(grain).end.subtract(1, 'day');
    return [`P${intervalValue}D`, end.toISOString()];
  }
  warn(`No operator was found for the values '${filter.values.join(',')}'`, {
    id: 'time-dimension-filter-builder-no-operator',
  });

  return [];
}

export function internalOperatorForValues(filter: FilterLike): InternalOperatorType {
  const { values, operator } = filter;
  const [startStr, endStr] = values as string[];

  if (!startStr && !endStr && operator === 'bet') {
    // there's no values
    return OPERATORS.dateRange;
  } else if (!(startStr && endStr)) {
    // there's only one value
    if (operator === 'gte') {
      return OPERATORS.since;
    } else if (operator === 'lte') {
      return OPERATORS.before;
    }
  }

  const interval = Interval.parseFromStrings(startStr, endStr);
  const { start, end } = interval.asStrings();
  const [lookbackDuration, lookbackGrain] = parseDuration(start) || [];

  let internalId: InternalOperatorType;
  if (start === 'current' && end === 'next') {
    internalId = OPERATORS.current;
  } else if (
    lookbackDuration &&
    lookbackGrain &&
    ['day', 'week', 'month', 'year'].includes(lookbackGrain) &&
    end === 'current'
  ) {
    internalId = OPERATORS.lookback;
  } else if (moment.isMoment(interval['_start']) && end === 'current') {
    internalId = OPERATORS.since;
  } else if (moment.isMoment(interval['_start']) && moment.isMoment(interval['_end'])) {
    internalId = OPERATORS.dateRange;
  } else {
    internalId = OPERATORS.advanced;
  }

  assert(`A component for ${operator} [${values.join(',')}] exists`, internalId);
  return internalId;
}

export default class TimeDimensionFilterBuilder extends BaseFilterBuilderComponent<TimeDimensionFilterArgs> {
  @computed('args.filter.parameters.grain')
  get timeGrainName() {
    return capitalize(this.args.filter.parameters.grain);
  }

  /**
   * list of valid operators for a time-dimension filter
   */
  @computed('args.filter.parameters.grain', 'timeGrainName')
  get valueBuilders(): InteralFilterBuilderOperators[] {
    return [
      {
        operator: 'bet' as const,
        internalId: OPERATORS.current,
        name: `Current ${this.timeGrainName}`,
        component: 'filter-values/time-dimension/current',
      },
      {
        operator: 'bet' as const,
        internalId: OPERATORS.lookback,
        name: 'In The Past',
        component: 'filter-values/time-dimension/lookback',
      },
      {
        operator: 'gte' as const,
        internalId: OPERATORS.since,
        name: 'Since',
        component: 'filter-values/time-dimension/date',
      },
      {
        operator: 'lte' as const,
        internalId: OPERATORS.before,
        name: 'Before',
        component: 'filter-values/time-dimension/date',
      },
      {
        operator: 'bet' as const,
        internalId: OPERATORS.dateRange,
        name: 'Between',
        component: 'filter-values/time-dimension/range',
      },
      {
        operator: 'bet' as const,
        internalId: OPERATORS.advanced,
        name: 'Advanced',
        component: 'filter-values/time-dimension/advanced',
      },
    ];
  }

  /**
   * Finds the appropriate interval operator to modify an existing interval
   * @returns the best supported operator for this interval
   */
  @computed('args.filter.{values,operator}', 'supportedOperators')
  get selectedValueBuilder(): InteralFilterBuilderOperators {
    const internalId = this.args.filter.validations.isValid
      ? internalOperatorForValues(this.args.filter)
      : OPERATORS.advanced;

    const filterValueBuilder = this.valueBuilders.find((f) => f.internalId === internalId);
    assert(`A filter value component for ${internalId} operator exists`, filterValueBuilder);
    return filterValueBuilder;
  }

  /**
   * @param operator - a value from supportedOperators that should become the filter's operator
   */
  @action
  setOperator(newBuilder: InteralFilterBuilderOperators) {
    const oldOperator = this.selectedValueBuilder;

    if (oldOperator.internalId === newBuilder.internalId) {
      return;
    }

    const { filter } = this.args;
    const { grain } = filter.parameters;

    const newInterval = valuesForOperator(filter, grain as Grain, newBuilder.internalId);

    this.args.onUpdateFilter({
      operator: newBuilder.operator,
      values: arr(newInterval),
    });
  }
}
