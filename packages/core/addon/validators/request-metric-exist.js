/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseValidator from 'ember-cp-validations/validators/base';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { A as arr } from '@ember/array';

export default BaseValidator.extend({
  validate(value, options /*, model, attribute*/) {
    if (value) {
      const requestMetrics = options.request.metricColumns.map(c => c.canonicalName);
      const valueCanonicalName = value.canonicalName || canonicalizeMetric(value);

      return arr(requestMetrics).includes(valueCanonicalName);
    }
    return false;
  }
});
