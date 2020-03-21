/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';
import { computed, get, set } from '@ember/object';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { Copyable } from 'ember-copy';

const Validations = buildValidations({
  metric: validator('presence', {
    presence: true,
    message: 'The metric field cannot be empty'
  })
});

export default Fragment.extend(Copyable, Validations, {
  metric: DS.attr('metric'),
  parameters: DS.attr({ defaultValue: () => ({}) }),

  /**
   * returns a canonical name containing parameters if the metric is parameterized.
   * ex: revenue(currency=USD)
   * @return string
   */
  canonicalName: computed('metric.id', 'parameters.{}', function() {
    const metric = get(this, 'metric.id'),
      parameters = get(this, 'parameters') || {};

    return canonicalizeMetric({
      metric,
      parameters
    });
  }),

  /**
   * @method updateParameter - Update a parameter of the metric
   * @param {String} paramId - id property of parameter metadata object
   * @param {String} paramKey - name of the parameter type (e.g. currency)
   */
  updateParameter(paramId, paramKey) {
    const newParam = { [paramKey]: paramId };
    const parameters = this.parameters;

    set(this, 'parameters', Object.assign({}, parameters, newParam));
  },

  /**
   * Overrides Ember.Copyable implemented in Fragment.copy
   * @returns {MF.Fragment} - Copied Fragment from this fragment
   */
  copy() {
    return this.store.createFragment('bard-request/fragments/metric', {
      metric: get(this, 'metric'),
      parameters: Object.assign({}, get(this, 'parameters'))
    });
  }
});
