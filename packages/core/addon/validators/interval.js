/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';

const { isEmpty } = Ember;

export default BaseValidator.extend({
  validate(value, options) {
    if (!options || isEmpty(Object.keys(options))) {
      return true;
    }

    if (options.ascending) {
      if (!value || !value.isAscending()) {
        return this.createErrorMessage('notBefore', value, options);
      }
    }

    return true;
  }
});
