/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';
import isEqual from 'lodash/isEqual';
import { getRequestMetrics } from 'navi-visualizations/utils/chart-data';

const { get } = Ember;

export default BaseValidator.extend({
  validate(value, options/*, model, attribute*/) {
    let requestMetrics = getRequestMetrics(get(options, 'request'));
    return isEqual(value, requestMetrics);
  }
});
