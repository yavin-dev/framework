/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import moment from 'moment';

/**
 * @method isValidMoment
 *
 * Validates if param is a date
 * @param value
 * @returns {Boolean}
 */
export function isValidMoment(value) {
  if (!value) {
    return false;
  }

  return moment(new Date(value)).isValid();
}

export default buildHelper(args => isValidMoment(...args));
