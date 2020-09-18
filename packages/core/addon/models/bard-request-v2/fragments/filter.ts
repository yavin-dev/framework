/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import { validator, buildValidations } from 'ember-cp-validations';
import BaseFragment from './base';
import { Filter, FilterOperator } from 'navi-data/adapters/facts/interface';

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

/**
 * @augments {BaseFragment}
 */
export default class FilterFragment extends BaseFragment.extend(Validations) implements Filter {
  @attr('string', { defaultValue: 'in' })
  operator!: FilterOperator;

  @attr({ defaultValue: () => [] })
  values!: (string | number)[];
}
