/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@ember/component';
import layout from '../templates/components/dashboard-filters-collapsed-filter';
import { computed, get, getWithDefault } from '@ember/object';

const SUPPORTED_OPERATORS = {
  in: {
    longName: 'Equals'
  },
  notin: {
    longName: 'Not Equals'
  },
  null: {
    longName: 'Is Empty'
  },
  notnull: {
    longName: 'Is Not Empty'
  },
  contains: {
    longName: 'Contains'
  }
};

export default Component.extend({
  layout,
  classNames: ['dashboard-filters-collapsed-filter'],

  /**
   * The computed filter operator long name.
   *
   * @property {String} filterOperator
   */
  filterOperator: computed('filter.operator', function() {
    const op = get(this, 'filter.operator');

    return getWithDefault(SUPPORTED_OPERATORS, `${op}.longName`, op);
  })
});
