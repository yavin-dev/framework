/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';

const { isArray, isPresent } = Ember;

export default BaseValidator.extend({
  validate(value, options) {
    if (isArray(value) && value.every(isPresent) && !value.some(isNaN)) {
      return true;
    }
    return this.createErrorMessage('Not all values in the array are numbers', value, options);
  }
});
