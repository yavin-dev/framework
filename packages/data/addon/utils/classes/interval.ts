/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { assert } from '@ember/debug';
import moment, { Moment } from 'moment';
import Duration, { isIsoDurationString } from './duration';
import DurationUtils from '../duration-utils';
import { getPeriodForGrain, Grain } from '../date';

const CURRENT = 'current';
const NEXT = 'next';
const MACROS = <const>[CURRENT, NEXT];

function isMacro(property: unknown): property is typeof MACROS[number] {
  const allMacros: string[] = [...MACROS];
  return typeof property === 'string' && allMacros.includes(property);
}

type SerializedMoment = { start: Moment; end: Moment | undefined };
type SerializedWithEnd<T extends Moment | string> = { start: T; end: T };

type IntervalStart = Duration | Moment | typeof CURRENT;
type IntervalEnd = Moment | typeof CURRENT | typeof NEXT;

/**
 * Interval
 * Object holding a Bard interval with support for moments, durations, and macros
 *
 * Note: only supports "current" and "next" macros
 */
export default class Interval {
  private _start: IntervalStart;
  private _end: IntervalEnd;

  /**
   * @param start - inclusive interval boundary
   * @param end - exclusive interval boundary
   */
  constructor(start: IntervalStart, end: IntervalEnd) {
    assert('Interval start must be: Duration, moment, or macro', this._isAcceptedType(start));
    assert('Interval end must be: moment, or macro', this._isAcceptedType(end) && !Duration.isDuration(end));

    this._start = start;
    this._end = end;
  }

  /**
   * @param object to compare against
   * @returns whether or not this interval matches the given interval,
   *                    including matching start/end object types
   */
  isEqual(interval?: unknown): boolean {
    if (!Interval.isInterval(interval)) {
      return false;
    }

    // Simplify equals check by doing string comparison on start/end
    let thisStrings = this.asStrings(),
      intervalStrings = interval.asStrings();

    return thisStrings.start === intervalStrings.start && thisStrings.end === intervalStrings.end;
  }

  /**
   * @returns whether or not start is before end
   */
  isAscending(): boolean {
    /*
     * Handle the Case when we are doing 'current/next'
     * Value needs to be defined
     */
    if (this._start === CURRENT && this._end === NEXT) {
      return true;
    } else {
      let moments = this.asMoments();
      return moments.start.isBefore(moments.end);
    }
  }

  /**
   * Converts interval into a POJO with moments
   * @returns object with start and end properties
   */
  asMoments(): SerializedMoment {
    let start = this._start;
    let end: IntervalEnd | undefined = this._end;

    // Copy moments
    if (moment.isMoment(start)) {
      start = start.clone();
    }
    if (moment.isMoment(end)) {
      end = end.clone();
    }

    /*
     * Macro substitution
     * Note: currently only supports "current" and "next" macros
     */
    if (start === CURRENT) {
      start = moment.utc();
    }
    if (end === CURRENT) {
      end = moment.utc();
    }
    if (end === NEXT) {
      end = undefined;
    }

    // Duration substitution
    if (Duration.isDuration(start)) {
      assert('interval end cannot be "next" if start is a duration', end);
      start = DurationUtils.subtractDurationFromDate(end, start);
    }
    // - end as duration not currently supported
    return {
      start,
      end,
    };
  }

  /**
   * Converts interval into a POJO with moments that are aligned to the given time grain
   * @param grain - grain to align to
   * @param makeEndInclusiveIfSame - add an extra time period to include end date if it's equal to start date
   * @returns object with start and end properties
   */
  asMomentsForTimePeriod(grain: Grain, makeEndInclusiveIfSame = true): SerializedWithEnd<Moment> {
    const period = getPeriodForGrain(grain);

    let { start, end } = this.asMoments();

    // Handle the case where the end is undefined, hence it is 'next'
    if (end === undefined) {
      end = moment.utc().add(1, period);
    }

    // Make sure moments are start of time period
    start.startOf(grain);
    end.startOf(grain);

    if (makeEndInclusiveIfSame && start.isSame(end)) {
      end.startOf(grain).add(1, period);
    }

    return {
      start,
      end,
    };
  }

  /**
   * Converts interval into a POJO with moments that are aligned and inclusive to the given time grain
   * @param grain - grain to align to
   * @returns object with start and end properties
   */
  asMomentsInclusive(grain: Grain): SerializedWithEnd<Moment> {
    let { start, end } = this.asMomentsForTimePeriod(grain);
    end.subtract(1, getPeriodForGrain(grain));

    return {
      start,
      end,
    };
  }

  /**
   * Converts interval from [inclusive, inclusive] to [inclusive, exclusive] for the given grain
   * @param grain - grain to align to
   * @returns new interval with inclusive exclusive
   */
  makeEndExclusiveFor(grain: Grain): Interval {
    const period = getPeriodForGrain(grain);

    let { start, end } = this.asMoments();
    assert('when making the end of an interval exclusive, the end should exist', end);
    end.startOf(grain).add(1, period);

    return new Interval(start, end);
  }

  /**
   * Converts interval into another interval with moments that are aligned to the given grain
   * @param grain - grain to align to
   * @returns object with start and end properties
   */
  asIntervalForTimePeriod(grain: Grain): Interval {
    let { start, end } = this.asMomentsForTimePeriod(grain);
    return new Interval(start, end);
  }

  /**
   * Converts interval into a POJO with strings
   * @param momentFormat optional  string format
   * @returns object with start and end properties
   */
  asStrings(momentFormat?: string): SerializedWithEnd<string> {
    return {
      start: Interval._stringFromProperty(this._start, momentFormat),
      end: Interval._stringFromProperty(this._end, momentFormat),
    };
  }

  /**
   * Computes the difference in time buckets (inclusive) in the interval for a given timePeriod
   * @param grain - time grain
   * @returns end - start / time grain e.g. tomorrow(day) - today(day) / (1 (day)/ 24 (hours)) = 24 hours
   */
  diffForTimePeriod(grain: Grain): number {
    const moments = this.asMomentsForTimePeriod(grain);
    const period = getPeriodForGrain(grain);
    return moments.end.diff(moments.start, period);
  }

  /**
   * Computes an array of each date, bucketed by time grain,
   * between a given interval's start and end (exclusive)
   *
   * Ex: Each week between Jan 1 and May 1
   *
   * @function getDatesForInterval
   * @param interval
   * @param grain - string representation of the length of time for each date bucket, ex: 'week'
   * @returns moment representation of each date between interval's start and end
   */
  getDatesForInterval(grain: Grain): Moment[] {
    const range = this.asMomentsForTimePeriod(grain);
    const currentDate = range.start;
    const dates = [];

    const period = getPeriodForGrain(grain);
    while (currentDate.isBefore(range.end)) {
      dates.push(currentDate.clone());
      currentDate.add(1, period);
    }

    return dates;
  }

  /**
   * @param property - object to check
   * @returns whether or not the given object is an accepted type by Interval
   */
  private _isAcceptedType(property: unknown): boolean {
    return moment.isMoment(property) || Duration.isDuration(property) || isMacro(property);
  }

  /**
   * @returns whether or not object is an interval
   */
  static isInterval(object?: unknown): object is Interval {
    return object instanceof Interval;
  }

  /**
   * @param start - interval start
   * @param end - interval end
   * @returns inclusive/exclusive interval
   */
  static parseFromStrings(start: string, end: string): Interval {
    const intervalEnd = Interval.fromString(end);
    const intervalStart = Interval.fromString(start);
    assert('Interval start must not be "next"', intervalStart !== 'next');
    assert('Interval end must be: moment string or macro', !Duration.isDuration(intervalEnd));

    return new Interval(intervalStart, intervalEnd);
  }

  /**
   * @param start - interval start
   * @param end - interval end
   * @param grain - The grain to be included
   * @returns inclusive/exclusive interval that includes the end date at the given grain
   */
  static parseInclusive(start: string, end: string, grain: Grain): Interval {
    const intervalStart = Interval.fromString(start);
    const intervalEnd = Interval.fromString(end);
    if (moment.isMoment(intervalEnd)) {
      intervalEnd.add(1, getPeriodForGrain(grain));
    }

    assert('Interval start must not be "next"', intervalStart !== 'next');
    assert('Interval end must be: moment string or macro', !Duration.isDuration(intervalEnd));
    return new Interval(intervalStart, intervalEnd);
  }

  /**
   * @param property - string to parse
   * @param format optional format for date strings
   * @returns object most closely represented by string
   */
  static fromString(property: string, format?: string): IntervalStart | IntervalEnd {
    assert('Argument must be a string', typeof property === 'string');

    if (isMacro(property)) {
      return property;
    } else if (isIsoDurationString(property)) {
      return new Duration(property);
    } else {
      // Use moment's isValid to determine if string matches the date format
      let result = moment.parseZone(property, format);

      if (result.isValid()) {
        return result;
      }
    }

    throw new Error(`Cannot parse string: ${property}`);
  }

  /**
   * @param property - start or end to convert into string
   * @param format optional format for date strings
   * @returns string representation of given property
   */
  static _stringFromProperty(property: IntervalStart | IntervalEnd, format?: string): string {
    if (moment.isMoment(property)) {
      return format ? property.format(format) : property.toISOString();
    } else if (Duration.isDuration(property)) {
      return property.toString();
    } else {
      return property;
    }
  }
}
