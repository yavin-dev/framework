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
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
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
  @computed('requestFragment.{field,parameters,columnMetadata}')
  get displayName() {
    const { columnMetadata, parameters } = this.requestFragment;
    return getOwner(this)
      .lookup('service:navi-formatter')
      .formatMetric(columnMetadata, parameters);
  }

  /**
   * @property {Object} filter
   * @override
   */
  @computed('supportedOperators', 'requestFragment.{operator,metric,values.[]}')
  get filter() {
    const { requestFragment } = this;
    const { values, validations, operator: operatorId } = requestFragment;
    const operator = arr(this.supportedOperators).findBy('id', operatorId);

    console.log(operator);
    return {
      subject: requestFragment,
      operator,
      values: arr(values),
      validations
    };
  }
}

export default MetricFilterBuilderComponent;
