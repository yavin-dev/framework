/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import BaseValidator from 'ember-cp-validations/validators/base';
import { METRIC_SERIES, DIMENSION_SERIES, DATE_TIME_SERIES } from 'navi-core/utils/chart-data';

const CHART_TYPES = A([METRIC_SERIES, DIMENSION_SERIES, DATE_TIME_SERIES]);

export default BaseValidator.extend({
  validate(value /*, options, model, attribute*/) {
    return CHART_TYPES.includes(value);
  }
});
