/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseValidator from 'ember-cp-validations/validators/base';

// validator checks that every metric from the request is represented in the config
export default BaseValidator.extend({
  validate(value, options /*, model, attribute*/) {
    let requestMetrics = options?.request?.metrics?.content;
    if (requestMetrics !== undefined) {
      let matchesFound = true;
      // checks every metric in the request is in the config
      requestMetrics.forEach(requestMetric => {
        matchesFound = matchesFound && value.some(metric => metric.id === requestMetric.metric.id);
      });
      // checks that there aren't more metrics in the config than the request
      matchesFound = matchesFound && requestMetrics.length === value.length;
      return matchesFound;
    }
    return false;
  }
});
