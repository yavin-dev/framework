/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import moment, { Moment } from 'moment';

/**
 * @method isValidMoment
 *
 * Validates if param is a date
 * @param value
 * @returns {Boolean}
 */
export function isValidMoment(value: string | Moment): boolean {
  if (!value) {
    return false;
  }

  return moment(new Date(value as string | Date)).isValid();
}

export default buildHelper((args: Parameters<typeof isValidMoment>) => isValidMoment(...args));
