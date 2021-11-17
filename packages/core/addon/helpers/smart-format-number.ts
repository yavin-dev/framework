/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { helper as buildHelper } from '@ember/component/helper';
import numbro from 'numbro';

/**
 * Formats the number smartly
 * For 0 and numbers between 1 and 100 format with 2 decimal places
 * For numbers between 0.0001 and 1 format with 4 decimal places
 * For numbers less than 0.0001 format using exponential notation
 * For NaN return empty string
 *
 * @method smartFormatNumber
 * @param value
 * @return Formatted string for the provided number
 */
export function smartFormatNumber([value]: Array<number | string>): string {
  // type safe check
  let hasPoint = value !== undefined && JSON.stringify(value).indexOf('.') !== -1;
  if (typeof value !== 'number') {
    value = parseFloat(value);
  }

  if (isNaN(value)) {
    return '';
  }

  let absValue = Math.abs(value);

  if (absValue === 0 || (absValue >= 1 && absValue < 100)) {
    return numbro(value).format({ mantissa: 2, optionalMantissa: !hasPoint, thousandSeparated: true });
  } else if (absValue >= 0.0001 && absValue < 1) {
    return numbro(value).format({ mantissa: 4 });
  } else if (absValue < 0.0001) {
    return value.toExponential(4);
  }
  return numbro(value).format({ thousandSeparated: true });
}

export default buildHelper(smartFormatNumber);
