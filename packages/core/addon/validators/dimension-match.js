/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseValidator from 'ember-cp-validations/validators/base';

// validator checks that every dimension from the request is represented in the config
export default BaseValidator.extend({
  validate(value, options /* model, attribute*/) {
    let requestDimensions = options?.request?.dimensions?.content;
    if (requestDimensions !== undefined) {
      let matchesFound = true;
      // checks every dimension in the request is in the config
      requestDimensions.forEach(requestDimension => {
        matchesFound = matchesFound && value.some(dimension => dimension.id === requestDimension.dimension.id);
      });
      // checks that there aren't more dimensions in the config than the request
      matchesFound = matchesFound && requestDimensions.length === value.length;
      return matchesFound;
    }
    return false;
  }
});
