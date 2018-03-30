/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import MF from 'model-fragments';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const { Fragment } = MF;

const { computed, get, set } = Ember,
      Validations = buildValidations({
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
              let dimensionName = Ember.get(this, 'model.dimension.longName');
              return `${dimensionName} filter needs at least one value`;
            }
          }),
          validator('array-empty-value', {
            message: 'A filter cannot have any empty values'
          })
        ]
      });

export default Fragment.extend(Validations, {
  dimension:      DS.attr('dimension'),
  operator:       DS.attr('string', { defaultValue: 'in' }),
  rawValues:      DS.attr({ defaultValue: () => Ember.A([]) }),
  field:          DS.attr( 'string', { defaultValue: 'id' } ),

  dimensionService: Ember.inject.service('bard-dimensions'),

  /**
   * @property {DS.PromiseArray} values - dimension model objects computed from rawValues
   */
  values: computed('rawValues', 'field', {
    get() {
      if (get(this, 'operator') === 'contains') {
        let rawValues = get(this, 'rawValues'),
            promise = new Ember.RSVP.resolve(rawValues);

        return DS.PromiseArray.create({ promise });
      } else {
        let dimensionName = get(this, 'dimension.name'),
            values = Ember.A(get(this, 'rawValues')).join(','),
            dimensionService = get(this, 'dimensionService');

        return DS.PromiseArray.create({
          promise: dimensionService.find(dimensionName, { values }).then(values => Ember.A(values))
        });
      }
    },

    set(type, value) {

      // some operators don't need to be mapped, as values don't always have id fields and mapping by ID will cause errors
      if (['contains', 'null', 'notnull'].includes(get(this, 'operator'))) {
        set(this, 'rawValues', value);
      } else {
        set(this, 'rawValues', Ember.A(value).mapBy('id'));
      }
      return value;
    }
  })
});
