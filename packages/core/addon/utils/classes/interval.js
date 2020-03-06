/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { assert } from '@ember/debug';
import { A } from '@ember/array';
import moment from 'moment';
import Duration from './duration';
import { isIsoDurationString } from './duration';
import DateUtils from '../date';
import DurationUtils from '../duration-utils';

const CURRENT = 'current';
const NEXT = 'next';
const MACROS = A([CURRENT, NEXT]);

/**
 * Interval
 * Object holding a Bard interval with support for moments, durations, and macros
 *
 * Note: only supports "current" and "next" macros
 *
 * @class
 */
export default class Interval {
  /**
   * @param {Duration|moment|String} start - inclusive interval boundary
   * @param {Duration|moment|String} end - exclusive interval boundary
   */
  constructor(start, end) {
    assert('Interval start must be: Duration, moment, or macro', this._isAcceptedType(start));
    assert('Interval end must be: moment, or macro', this._isAcceptedType(end) && !Duration.isDuration(end));

    this._start = start;
    this._end = end;
  }

  /**
   * @method isEqual
   * @param {Interval} object to compare against
   * @returns {Boolean} whether or not this interval matches the given interval,
   *                    including matching start/end object types
   */
  isEqual(interval) {
    if (!Interval.isInterval(interval)) {
      return false;
    }

    // Simplify equals check by doing string comparison on start/end
    let thisStrings = this.asStrings(),
      intervalStrings = interval.asStrings();

    return thisStrings.start === intervalStrings.start && thisStrings.end === intervalStrings.end;
  }

  /**
   * @method isAscending
   * @returns {Boolean} whether or not start is before end
   */
  isAscending() {
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
   * @method asMoments
   * @returns {Object} object with start and end properties
   */
  asMoments() {
    let start = this._start,
      end = this._end;

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
   * @method asMomentsForTimePeriod
   * @param {String} timePeriod - period to align to
   * @param {Boolean} makeEndInclusiveIfSame - add an extra time period to include end date if it's equal to start date
   * @returns {Object} object with start and end properties
   */
  asMomentsForTimePeriod(timePeriod, makeEndInclusiveIfSame = true) {
    /*
     * moment does not know how to deal with all,
     * and we only concern day here, so use day as base unit
     */
    if (timePeriod === 'all') {
      timePeriod = 'day';
    }

    let moments = this.asMoments();

    // Handle the case where the end is undefined, hence it is 'next'
    if (this._end === NEXT) {
      moments.end = moment().add(1, timePeriod);
    }

    // Make sure moments are start of time period
    moments.start.startOf(DateUtils.getIsoDateTimePeriod(timePeriod));
    moments.end.startOf(DateUtils.getIsoDateTimePeriod(timePeriod));

    if (makeEndInclusiveIfSame && moments.start.isSame(moments.end)) {
      moments.end.startOf(DateUtils.getIsoDateTimePeriod(timePeriod)).add(1, timePeriod);
    }

    return moments;
  }

  /**
   * Converts interval into another interval with moments that are aligned to the given time period
   * @method asIntervalForTimePeriod
   * @param {String} timePeriod - period to align to
   * @returns {Object} object with start and end properties
   */
  asIntervalForTimePeriod(timePeriod) {
    let { start, end } = this.asMomentsForTimePeriod(timePeriod);
    return new Interval(start, end);
  }

  /**
   * Converts interval into a POJO with strings
   * @method asStrings
   * @param {String} [momentFormat] optional  string format
   * @returns {Object} object with start and end properties
   */
  asStrings(momentFormat) {
    return {
      start: Interval._stringFromProperty(this._start, momentFormat),
      end: Interval._stringFromProperty(this._end, momentFormat)
    };
  }

  /**
   * Computes the difference in time buckets (inclusive) in the interval for a given timePeriod
   * @method diffForTimePeriod
   * @param {String} timePeriod  corresponds to the timeGrain string used in the navi request object
   * @returns {Number} end - start / time Period e.g. tomorrow(day) - today(day) / (1 (day)/ 24 (hours)) = 24 hours
   */
  diffForTimePeriod(timePeriod) {
    let moments = this.asMomentsForTimePeriod(timePeriod);
    return timePeriod === 'all' ? 1 : moments.end.diff(moments.start, timePeriod + 's');
  }

  /**
   * @method _isAcceptedType
   * @private
   * @param {Object} property - object to check
   * @returns {Boolean} whether or not the given object is an accepted type by Interval
   */
  _isAcceptedType(property) {
    return moment.isMoment(property) || Duration.isDuration(property) || MACROS.includes(property);
  }

  /**
   * @static
   * @method isInterval
   * @returns {Boolean} whether or not object is an interval
   */
  static isInterval(object) {
    return object instanceof Interval;
  }

  /**
   * @static
   * @method parseFromStrings
   * @param {String} start - interval start
   * @param {String} end - interval end
   * @returns {Interval} object parsed from given strings
   */
  static parseFromStrings(start, end) {
    return new Interval(Interval.fromString(start), Interval.fromString(end));
  }

  /**
   * @static
   * @method fromString
   * @param {String} property - string to parse
   * @param {String} [format] optional format for date strings
   * @returns {Duration|moment|String} object most closely represented by string
   */
  static fromString(property, format = DateUtils.API_DATE_FORMAT_STRING) {
    assert('Argument must be a string', typeof property === 'string');

    if (MACROS.includes(property)) {
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
   * @static
   * @private
   * @method _stringFromProperty
   * @param {Duration|moment|String} property - start or end to convert into string
   * @param {String} [format] optional format for date strings
   * @returns {String} string representation of given property
   */
  static _stringFromProperty(property, format = DateUtils.API_DATE_FORMAT_STRING) {
    if (moment.isMoment(property)) {
      return property.format(format);
    } else if (Duration.isDuration(property)) {
      return property.toString();
    } else {
      return property;
    }
  }
}
