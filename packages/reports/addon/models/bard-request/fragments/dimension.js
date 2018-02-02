/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import MF from 'model-fragments';
import { validator, buildValidations } from 'ember-cp-validations';

const { Fragment } = MF;

const Validations = buildValidations({
  dimension: validator('presence', {
    presence: true,
    message: 'The dimension field cannot be empty'
  })
});

export default Fragment.extend(Validations, {
  dimension:  DS.attr('dimension')
});
