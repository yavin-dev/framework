/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';

/**
 * Enum for supported date units
 * @enum {String}
 */
const DATE_UNITS = {
  D: 'day',
  W: 'week',
  M: 'month',
  Y: 'year'
};

/**
 * Enum for supported time units
 * @enum {String}
 */
const TIME_UNITS = {
  H: 'hour',
  M: 'minute',
  S: 'second'
};

// Regex for parsing iso date duration strings
const VALID_ISO_DATE_DURATION = new RegExp(`^P([1-9]\\d*)([${Object.keys(DATE_UNITS).join('')}]$)`);

// Regex for parsing iso time duration strings
const VALID_ISO_TIME_DURATION = new RegExp(`^PT([1-9]\\d*)([${Object.keys(TIME_UNITS).join('')}]$)`);

// Designator for all duration
const ALL = '__ALL__';

/**
 * Parses given duration string
 *
 * @function parseDuration
 * @param {String} duration
 * @returns {Array|null} - [value, unit]
 */
export function parseDuration(duration) {
  if (duration === ALL) {
    // All Duration with value as all-designator and unit as undefined
    return [duration, undefined];
  }

  let time = VALID_ISO_TIME_DURATION.exec(duration);
  if (time) {
    return [Number(time[1]), TIME_UNITS[time[2]]];
  }

  let date = VALID_ISO_DATE_DURATION.exec(duration);
  if (date) {
    return [Number(date[1]), DATE_UNITS[date[2]]];
  }

  return null;
}

/**
 * @function isIsoDurationString
 * @param {String} duration
 * @returns {Boolean} whether or not the string matches the ISO duration format
 */
export function isIsoDurationString(duration) {
  return !!parseDuration(duration);
}

/**
 * Duration
 * @class
 */
let DurationClass = class Duration {
  /**
   * Duration constructor
   *
   * @param {String} isoDuration
   */
  constructor(isoDuration) {
    let duration = parseDuration(isoDuration);
    Ember.assert(`${isoDuration} is an Invalid ISO duration`, duration);

    let [value, unit] = duration;
    this._value = value;
    this._unit = unit;
    this._isoDuration = isoDuration;
  }

  /**
   * Getter for _value
   *
   * @method getValue
   * @returns {Object} - value of duration
   */
  getValue() {
    return this._value;
  }

  /**
   * Getter for _unit
   *
   * @method getUnit
   * @returns {String} - time unit of duration
   */
  getUnit() {
    return this._unit;
  }

  /**
   * Coverts duration to string
   *
   * @method toString
   * @returns {String} - duration string
   */
  toString() {
    return this._isoDuration;
  }

  /**
   * Evaluates if instance is equal to given ISO duration
   *
   * @method isEqual
   * @param {String} duration - ISO duration
   * @returns {Boolean}
   */
  isEqual(duration) {
    let [value, unit] = parseDuration(duration);
    return this._value === value && this._unit === unit;
  }

  /**
   * Converts duration object to human readable form
   *
   * @method humanize
   * @returns {String} - human readable form of duration
   */
  humanize() {
    let value = this._value;
    if (Duration.isAll(this)) {
      return 'All';
    }

    // unit should be plural if value is greater than one
    let unit = Ember.String.capitalize(this._unit);
    if (value > 1) {
      unit += 's';
    }
    return `${value} ${unit}`;
  }

  /**
   * Compares the instance to a given duration
   *
   * @method compare
   * @param {string} durationString
   * @returns {number} - 0 for equality, -1 for less than, 1 for greater than
   */
  compare(durationString) {
    let [value, unit] = parseDuration(durationString),
      instanceValue = this._value;

    if (value === ALL || Duration.isAll(this)) {
      // Treating all duration as infinity for numerical comparison
      value = value === ALL ? Infinity : value;
      instanceValue = this._value === ALL ? Infinity : this._value;
    } else {
      // Check for same time units
      Ember.assert('Duration units need to match', this._unit === unit);
    }

    //Considering default case as equals
    let result = 0;
    if (instanceValue < value) {
      result = -1;
    } else if (instanceValue > value) {
      result = 1;
    }

    return result;
  }

  /**
   * Checks if given duration is all duration
   *
   * @static
   * @function isAll
   * @param {Duration} duration
   * @returns {Boolean} - true if duration is all duration else false
   */
  static isAll(duration) {
    if (Duration.isDuration(duration)) {
      return duration.getValue() === ALL && duration.getUnit() === undefined;
    }
    return false;
  }

  /**
   * Returns an instance of all Duration
   *
   * @static
   * @function all
   * @returns {Duration} - all Duration instance
   */
  static all() {
    return new Duration(ALL);
  }

  /**
   * Verifies if given Object is a Duration oject
   *
   * @static
   * @function isDuration
   * @returns {Boolean} - true if given Object is a Duration Object else false
   */
  static isDuration(object) {
    return object instanceof Duration;
  }
};

/**
 * Designator for all duration
 *
 * @static
 * @property ALL
 * @type {string}
 */
DurationClass.ALL = ALL;

export default DurationClass;
