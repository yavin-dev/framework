/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Fragment from 'ember-data-model-fragments/fragment';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  table: validator('presence', {
    presence: true,
    message: 'Table is invalid or unavailable'
  }),
  timeGrain: validator('presence', {
    presence: true,
    message: 'The timeGrain field cannot be empty'
  })
});

export default Fragment.extend(Validations, {
  table: DS.attr('table'),
  timeGrain: DS.attr('string')
});
