/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import { validator, buildValidations } from 'ember-cp-validations';
import BaseFragment from './base';

const Validations = buildValidations({
  operator: validator('presence', {
    presence: true,
    message: 'The `operator` filter field cannot be empty'
  }),
  values: validator('collection', {
    collection: true,
    message() {
      const { field } = this.model;
      return `${field} filter must be a collection`;
    }
  })
});

export default BaseFragment.extend(Validations, {
  operator: attr('string', { defaultValue: 'in' }),
  values: attr({
    defaultValue() {
      return [];
    }
  })
});
