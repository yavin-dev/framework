/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import BaseFragment from '../request/base';
import { Filter } from 'navi-data/adapters/facts/interface';

const Validations = buildValidations({
  operator: validator('presence', {
    presence: true,
    message: 'The `operator` filter field cannot be empty',
  }),
  values: validator('collection', {
    collection: true,
    message() {
      const { field } = this.model;
      return `${field} filter must be a collection`;
    },
  }),
});

/**
 * @augments {BaseFragment}
 */
export default class FilterFragment extends BaseFragment.extend(Validations) implements Filter {
  @attr('string', { defaultValue: 'in' })
  operator!: Filter['operator'];

  @attr({ defaultValue: () => [] })
  values!: Filter['values'];
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'request/filter': FilterFragment;
  }
}
