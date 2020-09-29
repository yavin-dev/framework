/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseValidator from 'ember-cp-validations/validators/base';
import { getRequestDimensions } from 'navi-core/utils/chart-data';

export default BaseValidator.extend({
  validate(value, options /*, model, attribute*/) {
    const { request } = options;
    return getRequestDimensions(request).length === 0;
  }
});
