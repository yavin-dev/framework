/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@ember/component';
import layout from '../templates/components/dashboard-filters-collapsed-filter';
import { computed, get, getWithDefault } from '@ember/object';
import { A as arr } from '@ember/array';
import { isEmpty } from '@ember/utils';

const SUPPORTED_OPERATORS = {
  in: {
    longName: 'equals'
  },
  notin: {
    longName: 'not equals'
  },
  null: {
    longName: 'is empty'
  },
  notnull: {
    longName: 'is not empty'
  },
  contains: {
    longName: 'contains'
  }
};

export default Component.extend({
  layout,
  classNames: ['dashboard-filters-collapsed-filter'],

  /**
   * The computed filter dimension display name.
   *
   * @property {String} filterDimension
   */
  filterDimension: computed('filter.dimension.{name,longName}', function() {
    const dimension = get(this, 'filter.dimension');
    const longName = get(this, 'filter.dimension.longName');
    const name = get(this, 'filter.dimension.name');

    if (longName) {
      return longName;
    }

    if (name) {
      return name;
    }

    if (typeof dimension === 'string' && dimension) {
      return dimension;
    }

    return 'Unknown Dimension';
  }),

  /**
   * The computed filter operator display name.
   *
   * @property {String} filterOperator
   */
  filterOperator: computed('filter.operator', function() {
    const op = get(this, 'filter.operator');

    if (!op) {
      return 'noop';
    }

    return getWithDefault(SUPPORTED_OPERATORS, `${op}.longName`, op);
  }),

  /**
   * The list of filter value text to display.
   *
   * @property {Array<String>} filterValues
   */
  filterValues: computed('filter.{rawValues.[],values.[],field}', function() {
    const field = get(this, 'filter.field');
    const rawValues = get(this, 'filter.rawValues');
    const values = arr(get(this, 'filter.values'));

    return rawValues.map(rawValue => {
      const value = values.findBy(field, rawValue);

      return isEmpty(value) ? rawValue : value;
    });
  })
});
