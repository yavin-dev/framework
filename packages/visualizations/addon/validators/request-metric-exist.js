/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';
import { getRequestMetrics } from 'navi-visualizations/utils/chart-data';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const { get, A:arr, getWithDefault } = Ember;

export default BaseValidator.extend({
  validate(value, options/*, model, attribute*/) {
    if(value) {
      let requestMetrics = getRequestMetrics(getWithDefault(options, 'request', {})).map(metric => get(metric, 'canonicalName') || canonicalizeMetric(metric)),
          valueCanonicalName = get(value, 'canonicalName') || canonicalizeMetric(value);

      return arr(requestMetrics).includes(valueCanonicalName);
    }
    return false;
  }
});
