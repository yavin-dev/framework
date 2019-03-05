/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  interval: [
    validator('presence', {
      presence: true,
      message: 'Please select a date range'
    }),
    validator('interval', {
      ascending: true,
      message: 'The start date should be before end date'
    })
  ]
});

export default Fragment.extend(Validations, {
  interval: DS.attr()
});
