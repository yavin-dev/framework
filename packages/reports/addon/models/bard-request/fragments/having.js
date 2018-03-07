/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import MF from 'model-fragments';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const { Fragment, fragment } = MF;

const { A:array, computed, get, set } = Ember,
      Validations = buildValidations({
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
              let metricName = get(this, 'model.metric.longName');
              return `${metricName} filter must be a number`;
            }
          })
        ]
      });

export default Fragment.extend(Validations, {
  metric:   fragment('bard-request/fragments/metric', { defaultValue: () => { return {}; } }),
  operator: DS.attr('string', { defaultValue: 'gt' }),
  values:   DS.attr({ defaultValue: () => Ember.A([]) }),

  value: computed('values', {
    get() {
      return get(this, 'values')[0];
    },

    set(type, value) {
      set(this, 'values', array([value]));
      return value;
    }
  })
});
