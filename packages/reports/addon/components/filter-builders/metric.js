/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/metric
 *       requestFragment=request.filters.firstObject
 *   }}
 */
import Ember from 'ember';
import Base from './base';

const { computed, get } = Ember;

export default Base.extend({
  /**
   * @property {Object} requestFragment - having fragment from request model
   */
  requestFragment: undefined,

  /**
   * @property {Array} supportedOperators
   * @override
   */
  supportedOperators: [
    { id: 'gt',     longName: 'Greater than (>)',            valuesComponent: 'filter-values/value-input' },
    { id: 'gte',    longName: 'Greater than or equals (>=)', valuesComponent: 'filter-values/value-input' },
    { id: 'lt',     longName: 'Less than (<)',               valuesComponent: 'filter-values/value-input' },
    { id: 'lte',    longName: 'Less than or equals (<=)',    valuesComponent: 'filter-values/value-input' },
    { id: 'eq',     longName: 'Equals (=)',                  valuesComponent: 'filter-values/value-input' },
    { id: 'neq',    longName: 'Not equals (!=)',             valuesComponent: 'filter-values/value-input' },
    { id: 'bet',    longName: 'Between (<=>)',               valuesComponent: 'filter-values/range-input' },
    { id: 'nbet',   longName: 'Not between (!<=>)',          valuesComponent: 'filter-values/range-input' }
  ],

  /**
   * @property {Object} filter
   * @override
   */
  filter: computed('requestFragment.{operator,metric,values.[]}', function() {
    const metricFragment = get(this, 'requestFragment'),
          operatorId = get(metricFragment, 'operator'),
          operator = Ember.A(get(this, 'supportedOperators')).findBy('id', operatorId);

    return {
      subject: get(metricFragment, 'metric.metric'),
      operator,
      values: get(metricFragment, 'values'),
      validations: get(metricFragment, 'validations')
    };
  })
});
