/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper } from '@ember/component/helper';
import config from 'ember-get-config';

export function checkConfig([name, value]/*, hash*/) {
  return config[name] === value;
}

export default helper(checkConfig);
