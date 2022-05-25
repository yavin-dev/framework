/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import moment from 'moment';
import type { Moment } from 'moment';
import invariant from 'tiny-invariant';
import Duration, { isIsoDurationString } from './duration.js';
import { subtractDurationFromDate } from '../duration-utils.js';
import { DateTimePeriod, getPeriodForGrain, Grain } from '../date.js';

const CURRENT = 'current';
const NEXT = 'next';
const MACROS = <const>[CURRENT, NEXT];

function isMacro(property: unknown): property is typeof MACROS[number] {
  const allMacros: string[] = [...MACROS];
  return typeof property === 'string' && allMacros.includes(property);
}

type SerializedMoment = { start: Moment; end: Moment };
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
    invariant(this._isAcceptedType(start), 'Interval start must be: Duration, moment, or macro');
    invariant(this._isAcceptedType(end) && !Duration.isDuration(end), 'Interval end must be: moment, or macro');

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
   * Converts interval into a POJO with moments
   * @param period - period to align to
   * @returns object with start and end properties
   */
  private _asMoments(period: DateTimePeriod): SerializedMoment {
    let start = this._start;
    let end = this._end;

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
      end = moment.utc().add(1, period);
    }

    // Duration substitution
    if (Duration.isDuration(start)) {
      start = subtractDurationFromDate(end, start);
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

    let { start, end } = this._asMoments(period);

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

    let { start, end } = this._asMoments(period);
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
      start: Interval.elementToString(this._start, momentFormat),
      end: Interval.elementToString(this._end, momentFormat),
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
    invariant(intervalStart !== 'next', 'Interval start must not be "next"');
    invariant(!Duration.isDuration(intervalEnd), 'Interval end must be: moment string or macro');

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

    invariant(intervalStart !== 'next', 'Interval start must not be "next"');
    invariant(!Duration.isDuration(intervalEnd), 'Interval end must be: moment string or macro');
    return new Interval(intervalStart, intervalEnd);
  }

  /**
   * @param property - string to parse
   * @param format optional format for date strings
   * @returns object most closely represented by string
   */
  static fromString(property: string, format?: string): IntervalStart | IntervalEnd {
    invariant(typeof property === 'string', 'Argument must be a string');

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
  static elementToString(property: IntervalStart | IntervalEnd, format?: string): string {
    if (moment.isMoment(property)) {
      return format ? property.format(format) : property.toISOString();
    } else if (Duration.isDuration(property)) {
      return property.toString();
    } else {
      return property;
    }
  }
}
