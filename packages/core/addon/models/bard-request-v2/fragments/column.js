/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import { validator, buildValidations } from 'ember-cp-validations';
import BaseFragment from './base';

const Validations = buildValidations({
  type: validator('inclusion', {
    in: ['dimension', 'metric'],
    allowBlank: true,
    message() {
      const { field } = this.model;
      return 'The `type` field of `' + field + '` column must equal to `dimension` or `metric`';
    }
  })
});

export default BaseFragment.extend(Validations, {
  type: attr('string'),
  alias: attr('string')
});
