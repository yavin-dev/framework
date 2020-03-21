/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { A as arr } from '@ember/array';
import { resolve } from 'rsvp';

const Validations = buildValidations({
  dimension: validator('presence', {
    presence: true,
    message: 'The dimension field in the filter cannot be empty'
  }),
  operator: validator('presence', {
    presence: true,
    message: 'The operator field in the filter cannot be empty'
  }),
  rawValues: [
    validator('length', {
      min: 1,
      message() {
        let dimensionName = get(this, 'model.dimension.name');
        return `${dimensionName} filter needs at least one value`;
      }
    }),
    validator('array-empty-value', {
      message: 'A filter cannot have any empty values'
    })
  ]
});

export default Fragment.extend(Validations, {
  dimension: DS.attr('dimension'),
  operator: DS.attr('string', { defaultValue: 'in' }),
  rawValues: DS.attr({ defaultValue: () => arr([]) }),
  field: DS.attr('string', { defaultValue: 'id' }),

  dimensionService: service('bard-dimensions'),

  /**
   * @property {DS.PromiseArray} values - dimension model objects computed from rawValues
   */
  values: computed('rawValues', 'field', {
    get() {
      if (get(this, 'operator') === 'contains') {
        let rawValues = get(this, 'rawValues'),
          promise = resolve(rawValues);

        return DS.PromiseArray.create({ promise });
      } else {
        let dimensionName = get(this, 'dimension.id'),
          values = arr(get(this, 'rawValues')),
          dimensionService = get(this, 'dimensionService');

        return DS.PromiseArray.create({
          promise: dimensionService.find(dimensionName, [{ values }]).then(arr)
        });
      }
    },

    set(type, value) {
      // some operators don't need to be mapped, as values don't always have id fields and mapping by ID will cause errors
      if (['contains', 'null', 'notnull', 'gte', 'lt', 'bet'].includes(get(this, 'operator'))) {
        set(this, 'rawValues', value);
      } else {
        set(this, 'rawValues', arr(value).mapBy('id'));
      }
      return value;
    }
  })
});
