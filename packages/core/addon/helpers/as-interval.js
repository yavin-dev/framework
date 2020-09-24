/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Coerces the input into an interval
 */
import { helper } from '@ember/component/helper';
import Interval from 'navi-data/utils/classes/interval';

export function asInterval([interval]) {
  if (typeof interval === 'string' && interval.length > 0) {
    //Expects format of Date/Date e.g. '2018-10-31/2018-11-05' for an interval between October 31 and November 5
    let intervalStrs = interval.split('/');

    return Interval.parseFromStrings(intervalStrs[0], intervalStrs[1]);
  }
  return interval;
}

export default helper(asInterval);
