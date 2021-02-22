/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { Grain } from 'navi-data/addon/utils/date';

const grainFormats: Record<Grain, string> = {
  second: 'HH:mm:ss',
  minute: 'HH:mm:00',
  hour: 'HH:00',
  day: 'MMM D',
  week: 'MMM D',
  isoWeek: 'MMM D',
  month: 'MMM YYYY',
  quarter: '[Q]Q YYYY',
  year: 'YYYY',
};

export default grainFormats;
