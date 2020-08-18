/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import { validator, buildValidations } from 'ember-cp-validations';
import BaseFragment from './base';
import { SortDirection, Sort } from 'navi-data/adapters/facts/interface';

const Validations = buildValidations({
  direction: validator('inclusion', {
    in: ['asc', 'desc'],
    message: 'The `direction` sort field must equal to `asc` or `desc`'
  })
});

/**
 * @augments {BaseFragment}
 */
export default class SortFragment extends BaseFragment.extend(Validations) implements Sort {
  @attr('string', { defaultValue: 'desc' })
  direction!: SortDirection;
}
