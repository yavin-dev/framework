/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import moment from 'moment';

export function guessTimezone() {
  return moment.tz.guess();
}

export default buildHelper(guessTimezone);
