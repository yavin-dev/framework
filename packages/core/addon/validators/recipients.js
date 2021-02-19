/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { isArray } from '@ember/array';
import { isPresent } from '@ember/utils';
import BaseValidator from 'ember-cp-validations/validators/base';
import { regularExpressions } from 'ember-validators/format';

export default BaseValidator.extend({
  validate(value, options) {
    if (value.length < 1 || value[0] === '') {
      return options.noRecipientsMsg;
    } else if (
      !(isArray(value) && value.every(isPresent) && value.every((index) => index.match(regularExpressions.email)))
    ) {
      return options.invalidEmailMsg;
    }
    return true;
  },
});
