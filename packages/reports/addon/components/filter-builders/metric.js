/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterBuilders::Metric
 *       @requestFragment={{this.request.filters.firstObject}}
 *   />
 */

import { A as arr } from '@ember/array';
import BaseFilterBuilderComponent from './base';
<<<<<<< HEAD
import { computed, get } from '@ember/object';
import { getOwner } from '@ember/application';
=======
import { computed } from '@ember/object';
import { metricFormat } from 'navi-data/helpers/metric-format';
import layout from 'navi-reports/templates/components/filter-builders/metric';
>>>>>>> Update: PR Comments
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from 'navi-reports/templates/components/filter-builders/metric';

@templateLayout(layout)
@tagName('')
class MetricFilterBuilderComponent extends BaseFilterBuilderComponent {
  /**
   * @property {Object[]} supportedOperators
   */
  supportedOperators = [
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

  /**
   * @property {Object} requestFragment - having fragment from request model
   */
  requestFragment = undefined;

  /**
   * @property {String} displayName - display name for the filter with metric and parameters
   */
  @computed('filter.subject.{metric,parameters}')
  get displayName() {
<<<<<<< HEAD
    let metric = get(this, 'filter.subject');
    return getOwner(this)
      .lookup('service:navi-formatter')
      .formatMetric(metric.metric, metric.parameters);
=======
    const metric = this.filter.subject;
    return metricFormat(metric, metric.metric?.name);
>>>>>>> Update: PR Comments
  }

  /**
   * @property {Object} filter
   * @override
   */
  @computed('requestFragment.{operator,metric,values.[]}')
  get filter() {
    const { requestFragment } = this;
    const { metric, values, validations, operator: operatorId } = requestFragment;
    const operator = arr(this.supportedOperators).findBy('id', operatorId);

    return {
      subject: metric,
      operator,
      values: arr(values),
      validations
    };
  }
}

export default MetricFilterBuilderComponent;
