/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';

import { set, get, computed } from '@ember/object';
import MF from 'model-fragments';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const { Fragment } = MF;

const Validations = buildValidations({
  table: validator('presence', {
    presence: true,
    message: 'Table is invalid or unavailable'
  }),
  timeGrainName: validator('presence', {
    presence: true,
    message: 'The timeGrainName field cannot be empty'
  })
});

export default Fragment.extend(Validations, {
  table: DS.attr('table'),
  timeGrainName: DS.attr('string'),

  /**
   * @property {Object} timeGrain - gets the timeGrain object from the timeGrainName or returns the first object
   *                                from table timeGrains as default
   */
  timeGrain: computed('table', 'timeGrainName', {
    get() {
      let timeGrains = A(get(this, 'table.timeGrains'));
      return timeGrains.findBy('name', get(this, 'timeGrainName'));
    },

    set(type, value) {
      set(this, 'timeGrainName', get(value, 'name'));
      return value;
    }
  })
});
