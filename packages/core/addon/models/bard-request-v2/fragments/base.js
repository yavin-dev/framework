/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  field: validator('presence', {
    presence: true,
    message: 'The `field` field cannot be empty'
  })
});

export default class Base extends Fragment.extend(Validations) {
  @attr('string') field;
  @attr({
    defaultValue() {
      return {};
    }
  })
  parameters;
}
