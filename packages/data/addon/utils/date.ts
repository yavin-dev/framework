/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import moment from 'moment';
import config from 'ember-get-config';
import { getFirstDayOfGrainSince, API_DATE_FORMAT_STRING, EPOCH_FORMAT_STRING } from '@yavin/client/utils/date';
import type { Grain } from '@yavin/client/utils/date';

/**
 * Returns the epoch date at the start of the given grain
 */
export function getFirstDayEpochForGrain(grain: Grain, dateFormat: string = API_DATE_FORMAT_STRING): string {
  const epochDate = moment(config.navi.dataEpoch, EPOCH_FORMAT_STRING);
  return getFirstDayOfGrainSince(epochDate, grain, dateFormat);
}
