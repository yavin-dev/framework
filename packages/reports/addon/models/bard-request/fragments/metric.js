/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import MF from 'model-fragments';
import { validator, buildValidations } from 'ember-cp-validations';
import { computed, get } from '@ember/object';

const { Fragment } = MF;

const Validations = buildValidations({
  metric: validator('presence', {
    presence: true,
    message: 'The metric field cannot be empty'
  })
});

export default Fragment.extend(Validations, {
  metric: DS.attr('metric'),
  parameters: DS.attr({ defaultValue: {}}),
  /**
   * returns a canonical name containing parameters if the metric is parameterized.
   * ex: revenue(currency=USD)
   * @return string
   */
  canonicalName: computed('metric', 'parameters', function() {
    const metric = get(this, 'metric.name'),
          parameters = get(this, 'parameters') || {};

    const serializeParams = (obj) => {
      let paramArray = Object.entries(obj);
      paramArray.sort(([keyA, ], [keyB, ]) => keyA.localeCompare(keyB));
      return paramArray.map(([key, value]) => `${key}=${value}`).join(',');
    };
    return Object.keys(parameters).length > 0 ? `${metric}(${serializeParams(parameters)})` : metric;
  })
});
