/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import invariant from 'tiny-invariant';
import Duration from './classes/duration';
import { getPeriodForGrain } from './date';
import type { Moment } from 'moment';

/**
 * Subtracts a given duration from a given date
 *
 * @param date - Moment object representing date
 * @param duration - duration to subtract from given date
 * @returns resultant date of the subtraction
 */
export function subtractDurationFromDate(date: Moment, duration: Duration): Moment {
  const value = duration.getValue();
  const unit = duration.getUnit();
  invariant(unit, 'The duration unit must be defined');
  const period = getPeriodForGrain(unit);
  invariant(typeof value === 'number', 'The duration has a number value of units');
  // Moment subtract mutates original date object hence the clone
  return date.clone().subtract(value, period);
}
