/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { get } from '@ember/object';
import BaseValidator from 'ember-cp-validations/validators/base';
import { isEqual } from 'lodash-es';

export default BaseValidator.extend({
  validate(value, options /*, model, attribute*/) {
    let request = get(options, 'request');
    if (request) {
      let requestDimensions = request.nonTimeDimensions;
      return isEqual(value, requestDimensions);
    }
  }
});
