/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { capitalize } from '@ember/string';
import { assert } from '@ember/debug';

/**
 * Enum for supported date units
 * @enum {String}
 */
type DateUnit = 'day' | 'week' | 'month' | 'year';
const DATE_UNITS: Record<string, DateUnit | undefined> = {
  D: 'day',
  W: 'week',
  M: 'month',
  Y: 'year'
};

/**
 * Enum for supported time units
 * @enum {String}
 */
type TimeUnit = 'hour' | 'minute' | 'second';
const TIME_UNITS: Record<string, TimeUnit | undefined> = <const>{
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

type DurationUnit = TimeUnit | DateUnit;

/**
 * Parses given duration string
 *
 * @param duration
 * @returns the value and unit of the duration
 */
export function parseDuration(duration: string): [typeof ALL, undefined] | [number, DurationUnit] | null {
  if (duration === ALL) {
    // All Duration with value as all-designator and unit as undefined
    return [duration, undefined];
  }

  let [, timeDuration, timeUnit] = VALID_ISO_TIME_DURATION.exec(duration) || [];
  const stringTimeUnit = TIME_UNITS[timeUnit];
  if (timeDuration && timeUnit && stringTimeUnit) {
    return [Number(timeDuration), stringTimeUnit];
  }

  let [, dateDuration, dateUnit] = VALID_ISO_DATE_DURATION.exec(duration) || [];
  const stringDateUnit = DATE_UNITS[dateUnit];
  if (dateDuration && dateUnit && stringDateUnit) {
    return [Number(dateDuration), stringDateUnit];
  }

  return null;
}

/**
 * @param duration
 * @returns whether or not the string matches the ISO duration format
 */
export function isIsoDurationString(duration: string): boolean {
  return !!parseDuration(duration);
}

type AllDuration = Duration & {
  _value: typeof ALL;
  _unit: undefined;
};

/**
 * Duration
 */
export default class Duration {
  static ALL = ALL;
  _value: typeof ALL | number;
  private _unit: DurationUnit | undefined;
  private _isoDuration: string;

  /**
   * @param isoDuration - duration of the format PX(D|M|W|Y) or PTX(H|M|S) where x is a number
   */
  constructor(isoDuration: string) {
    const duration = parseDuration(isoDuration);
    assert(`${isoDuration} is an Invalid ISO duration`, duration);

    const [value, unit] = duration;
    this._value = value;
    this._unit = unit;
    this._isoDuration = isoDuration;
  }

  /**
   * Getter for _value
   * @returns - value of duration
   */
  getValue(): typeof ALL | number {
    return this._value;
  }

  /**
   * Getter for _unit
   * @returns - time unit of duration
   */
  getUnit(): DurationUnit | undefined {
    return this._unit;
  }

  /**
   * Coverts duration to string
   * @returns duration string
   */
  toString(): string {
    return this._isoDuration;
  }

  /**
   * Evaluates if instance is equal to given ISO duration
   * @param duration - ISO duration
   */
  isEqual(duration: string | Duration): boolean {
    let value, unit;
    if (Duration.isDuration(duration)) {
      value = duration.getValue();
      unit = duration.getUnit();
    } else {
      [value, unit] = parseDuration(duration) || [];
    }
    return this._value === value && this._unit === unit;
  }

  /**
   * Converts duration object to human readable form
   * @returns - human readable form of duration
   */
  humanize(): string {
    if (Duration.isAll(this)) {
      return 'All';
    }

    const { _value: value, _unit } = this;
    const unit = capitalize(_unit || '');
    // unit should be plural if value is greater than one
    return `${value} ${unit}${value > 1 ? 's' : ''}`;
  }

  /**
   * Compares the instance to a given duration
   *
   * @param durationString
   * @returns 0 for equality, -1 for less than, 1 for greater than
   */
  compare(durationString: string): -1 | 0 | 1 {
    let [value, unit] = parseDuration(durationString) || [];
    assert('The duration must have a value', value);
    assert('Duration units need to match', this._unit === unit || value === ALL || Duration.isAll(this));

    let instanceValue = this._value;

    // Treating all duration as infinity for numerical comparison
    value = value === ALL ? Infinity : value;
    instanceValue = Duration.isAll(this) ? Infinity : this._value;

    if (instanceValue < value) {
      return -1;
    } else if (instanceValue > value) {
      return 1;
    } else {
      return 0;
    }
  }

  /**
   * Checks if given duration is all duration
   * @param duration
   * @returns true if is an all duration
   */
  static isAll(duration?: Duration): duration is AllDuration {
    if (Duration.isDuration(duration)) {
      return duration.getValue() === ALL && duration.getUnit() === undefined;
    }
    return false;
  }

  /**
   * Returns an instance of all Duration
   * @returns all Duration instance
   */
  static all(): Duration {
    return new Duration(ALL);
  }

  /**
   * Verifies if given Object is a Duration oject
   * @returns true if given Object is a Duration Object
   */
  static isDuration(object?: unknown): object is Duration {
    return object instanceof Duration;
  }
}
