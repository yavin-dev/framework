/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterBuilders::Metric
 *       @filter={{this.filter}}
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

  get supportedOperators() {
    return this.supportedOperators;
  }
  /**
   * @property {Object} filter - filter fragment from request model
   */
  filter = undefined;

  /**
   * @property {String} displayName - display name for the filter with metric and parameters
   */
  @computed('filter.{field,parameters,columnMetadata}')
  get displayName() {
    const { columnMetadata, parameters } = this.filter;
    return getOwner(this)
      .lookup('service:navi-formatter')
      .formatColumnName(columnMetadata, parameters);
  }

  /**
   *
   * @override
   */
  @computed('supportedOperators', 'filter.{operator,metric,values.[]}')
  get filter() {
    const { values, validations, operator: operatorId } = this.filter;
    const operator = arr(this.supportedOperators).findBy('id', operatorId);

    return {
      subject: this.filter,
      operator,
      values: arr(values),
      validations
    };
  }

  get selectedOperator() {
    return arr(this.supportedOperators).findBy('id', this.filter.operator);
  }
}

export default MetricFilterBuilderComponent;
