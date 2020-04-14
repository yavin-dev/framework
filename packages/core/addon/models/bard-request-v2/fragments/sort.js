/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import { validator, buildValidations } from 'ember-cp-validations';
import BaseFragment from './base';

const Validations = buildValidations({
  direction: validator('inclusion', {
    in: ['asc', 'desc'],
    message: 'The `direction` sort field must equal to `asc` or `desc`'
  })
});

export default class Sort extends BaseFragment.extend(Validations) {
  @attr('string', {
    defaultValue: 'desc'
  })
  direction;
}
