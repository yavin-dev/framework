/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseValidator from 'ember-cp-validations/validators/base';
import { getRequestMetrics } from 'navi-visualizations/utils/chart-data';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { get, getWithDefault } from '@ember/object';
import { A as arr } from '@ember/array';

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
