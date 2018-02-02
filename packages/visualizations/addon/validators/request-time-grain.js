/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseValidator from 'ember-cp-validations/validators/base';

export default BaseValidator.extend({
  validate(value/*, model, attribute*/) {
    return ['year'].includes(value);
  }
});
