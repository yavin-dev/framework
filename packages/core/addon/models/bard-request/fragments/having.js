/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A as array } from '@ember/array';
import { set, computed } from '@ember/object';
import DS from 'ember-data';
import { fragment } from 'ember-data-model-fragments/attributes';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';
import { getOwner } from '@ember/application';

const Validations = buildValidations({
  metric: validator('presence', {
    presence: true,
    message: 'The metric field in the having cannot be empty'
  }),
  operator: validator('presence', {
    presence: true,
    message: 'The operator field in the having cannot be empty'
  }),
  values: [
    validator('length', {
      min: 1,
      message: 'The values field in the having cannot be empty'
    }),
    validator('array-number', {
      message() {
        const { metric } = this.model;
        const naviFormatter = getOwner(this).lookup('service:navi-formatter');
        return `${naviFormatter.formatMetric(metric.metric, metric.parameters)} filter must be a number`;
      }
    })
  ]
});

export default Fragment.extend(Validations, {
  metric: fragment('bard-request/fragments/metric', {
    defaultValue: () => ({})
  }),
  operator: DS.attr('string', { defaultValue: 'gt' }),
  values: DS.attr({ defaultValue: () => array([]) }),

  value: computed('values', {
    get() {
      return this.values?.[0];
    },

    set(type, value) {
      set(this, 'values', array([value]));
      return value;
    }
  })
});
