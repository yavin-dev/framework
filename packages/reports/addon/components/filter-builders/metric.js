/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/metric
 *       requestFragment=request.filters.firstObject
 *   }}
 */

import { A as arr } from '@ember/array';
import Base from './base';
import { computed, get } from '@ember/object';
import layout from 'navi-reports/templates/components/filter-builders/metric';
import { getOwner } from '@ember/application';

export default Base.extend({
  layout,

  /**
   * @property {Object[]} supportedOperators
   */
  supportedOperators: computed(function() {
    return [
      {
        id: 'gt',
        name: 'Greater than (>)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'gte',
        name: 'Greater than or equals (>=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'lt',
        name: 'Less than (<)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'lte',
        name: 'Less than or equals (<=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'eq',
        name: 'Equals (=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'neq',
        name: 'Not equals (!=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'bet',
        name: 'Between (<=>)',
        valuesComponent: 'filter-values/range-input'
      },
      {
        id: 'nbet',
        name: 'Not between (!<=>)',
        valuesComponent: 'filter-values/range-input'
      }
    ];
  }),

  /**
   * @property {Object} requestFragment - having fragment from request model
   */
  requestFragment: undefined,

  /**
   * @property {String} displayName - display name for the filter with metric and parameters
   */
  displayName: computed('filter.subject.{metric,parameters}', function() {
    let metric = get(this, 'filter.subject');
    return getOwner(this)
      .lookup('service:navi-formatter')
      .formatMetric(metric.metric, metric.parameters);
  }),

  /**
   * @property {Object} filter
   * @override
   */
  filter: computed('requestFragment.{operator,metric,values.[]}', function() {
    const metricFragment = get(this, 'requestFragment'),
      operatorId = get(metricFragment, 'operator'),
      operator = arr(get(this, 'supportedOperators')).findBy('id', operatorId);

    return {
      subject: get(metricFragment, 'metric'),
      operator,
      values: arr(get(metricFragment, 'values')),
      validations: get(metricFragment, 'validations')
    };
  })
});
