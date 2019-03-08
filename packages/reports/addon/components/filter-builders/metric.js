/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/metric
 *       requestFragment=request.filters.firstObject
 *   }}
 */
import { A } from '@ember/array';

import Base from './base';
import { computed, get } from '@ember/object';
import { metricFormat } from 'navi-data/helpers/metric-format';
import layout from 'navi-reports/templates/components/filter-builders/metric';

export default Base.extend({
  layout,

  /**
   * @property {Object} requestFragment - having fragment from request model
   */
  requestFragment: undefined,

  /**
   * @property {String} displayName - display name for the filter with metric and parameters
   */
  displayName: computed('filter.subject.metric', 'filter.subject.parameters', function() {
    let metric = get(this, 'filter.subject');
    return metricFormat(metric, get(metric, 'metric.longName'));
  }),

  /**
   * @property {Array} supportedOperators
   * @override
   */
  supportedOperators: [
    {
      id: 'gt',
      longName: 'Greater than (>)',
      valuesComponent: 'filter-values/value-input'
    },
    {
      id: 'gte',
      longName: 'Greater than or equals (>=)',
      valuesComponent: 'filter-values/value-input'
    },
    {
      id: 'lt',
      longName: 'Less than (<)',
      valuesComponent: 'filter-values/value-input'
    },
    {
      id: 'lte',
      longName: 'Less than or equals (<=)',
      valuesComponent: 'filter-values/value-input'
    },
    {
      id: 'eq',
      longName: 'Equals (=)',
      valuesComponent: 'filter-values/value-input'
    },
    {
      id: 'neq',
      longName: 'Not equals (!=)',
      valuesComponent: 'filter-values/value-input'
    },
    {
      id: 'bet',
      longName: 'Between (<=>)',
      valuesComponent: 'filter-values/range-input'
    },
    {
      id: 'nbet',
      longName: 'Not between (!<=>)',
      valuesComponent: 'filter-values/range-input'
    }
  ],

  /**
   * @property {Object} filter
   * @override
   */
  filter: computed('requestFragment.{operator,metric,values.[]}', function() {
    const metricFragment = get(this, 'requestFragment'),
      operatorId = get(metricFragment, 'operator'),
      operator = A(get(this, 'supportedOperators')).findBy('id', operatorId);

    return {
      subject: get(metricFragment, 'metric'),
      operator,
      values: get(metricFragment, 'values'),
      validations: get(metricFragment, 'validations')
    };
  })
});
