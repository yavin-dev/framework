/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import MF from 'model-fragments';
import { validator, buildValidations } from 'ember-cp-validations';

const { Fragment } = MF;

const Validations = buildValidations({
  metric: validator('presence', {
    presence: true,
    message: 'The metric field in sort cannot be empty'
  }),
  direction: validator('presence', {
    presence: true,
    message: 'The direction field in sort cannot be empty'
  })
});

export default Fragment.extend(Validations, {
  metric:         DS.attr('sort'),
  direction:      DS.attr('string', { defaultValue: 'desc'})
});
