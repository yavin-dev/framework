/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { assert } from '@ember/debug';
import moment, { Moment } from 'moment';
import Duration, { isIsoDurationString } from './duration';
import DurationUtils from '../duration-utils';
import { API_DATE_FORMAT_STRING, getIsoDateTimePeriod, Grain } from '../date';

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
      start = moment();
    }
    if (end === CURRENT) {
      end = moment();
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
      end
    };
  }

  /**
   * Converts interval into a POJO with moments that are aligned to the given time period
   * @param timePeriod - period to align to
   * @param makeEndInclusiveIfSame - add an extra time period to include end date if it's equal to start date
   * @returns object with start and end properties
   */
  asMomentsForTimePeriod(timePeriod: Grain, makeEndInclusiveIfSame = true): SerializedWithEnd<Moment> {
    /*
     * moment does not know how to deal with all,
     * and we only concern day here, so use day as base unit
     */
    if (timePeriod === 'all') {
      timePeriod = 'day';
    }

    let { start, end } = this.asMoments();

    // Handle the case where the end is undefined, hence it is 'next'
    if (end === undefined) {
      end = moment().add(1, timePeriod);
    }

    // Make sure moments are start of time period
    start.startOf(getIsoDateTimePeriod(timePeriod));
    end.startOf(getIsoDateTimePeriod(timePeriod));

    if (makeEndInclusiveIfSame && start.isSame(end)) {
      end.startOf(getIsoDateTimePeriod(timePeriod)).add(1, timePeriod);
    }

    return {
      start,
      end
    };
  }

  /**
   * Converts interval into another interval with moments that are aligned to the given time period
   * @param timePeriod - period to align to
   * @returns object with start and end properties
   */
  asIntervalForTimePeriod(timePeriod: Grain): Interval {
    let { start, end } = this.asMomentsForTimePeriod(timePeriod);
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
      end: Interval._stringFromProperty(this._end, momentFormat)
    };
  }

  /**
   * Computes the difference in time buckets (inclusive) in the interval for a given timePeriod
   * @param timePeriod  corresponds to the timeGrain string used in the navi request object
   * @returns end - start / time Period e.g. tomorrow(day) - today(day) / (1 (day)/ 24 (hours)) = 24 hours
   */
  diffForTimePeriod(timePeriod: Grain): number {
    let moments = this.asMomentsForTimePeriod(timePeriod);
    return timePeriod === 'all' ? 1 : moments.end.diff(moments.start, timePeriod);
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

    if (grain === 'all') {
      return [currentDate.clone()];
    }

    while (currentDate.isBefore(range.end)) {
      dates.push(currentDate.clone());
      currentDate.add(1, grain);
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
   * @returns object parsed from given strings
   */
  static parseFromStrings(start: string, end: string): Interval {
    const intervalEnd = Interval.fromString(end);
    const intervalStart = Interval.fromString(start);
    assert('Interval start must not be "next"', intervalStart !== 'next');
    assert('Interval end must be: moment string or macro', !Duration.isDuration(intervalEnd));

    return new Interval(intervalStart, intervalEnd);
  }

  /**
   * @param property - string to parse
   * @param format optional format for date strings
   * @returns object most closely represented by string
   */
  static fromString(property: string, format = API_DATE_FORMAT_STRING): IntervalStart | IntervalEnd {
    assert('Argument must be a string', typeof property === 'string');

    if (isMacro(property)) {
      return property;
    } else if (isIsoDurationString(property)) {
      return new Duration(property);
    } else {
      // Use moment's isValid to determine if string matches the date format
      let result = moment(property, format);

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
  private static _stringFromProperty(property: IntervalStart | IntervalEnd, format = API_DATE_FORMAT_STRING): string {
    if (moment.isMoment(property)) {
      return property.format(format);
    } else if (Duration.isDuration(property)) {
      return property.toString();
    } else {
      return property;
    }
  }
}
