/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/dimension
 *       requestFragment=request.filters.firstObject
 *   }}
 */
import Base from './base';
import { computed, get } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import layout from 'navi-reports/templates/components/filter-builders/dimension';

export default Base.extend({
  layout,
  /**
   * @property {Object} requestFragment - filter fragment from request model
   */
  requestFragment: undefined,

  /**
   * @property {Array} supportedOperators
   * @override
   */
  supportedOperators: computed('requestFragment.dimension', function() {
    let storageStrategy = get(this, 'requestFragment.dimension.storageStrategy'),
      inputComponent = 'filter-values/dimension-select';

    //Allow free form input of dimension values when dimension's storageStrategy is 'none'
    if (storageStrategy === 'none') {
      inputComponent = 'filter-values/multi-value-input';
    }

    return [
      { id: 'in', longName: 'Equals', valuesComponent: inputComponent },
      { id: 'notin', longName: 'Not Equals', valuesComponent: inputComponent },
      {
        id: 'null',
        longName: 'Is Empty',
        valuesComponent: 'filter-values/null-input'
      },
      {
        id: 'notnull',
        longName: 'Is Not Empty',
        valuesComponent: 'filter-values/null-input'
      },
      {
        id: 'contains',
        longName: 'Contains',
        valuesComponent: 'filter-values/multi-value-input',
        showFields: true
      }
    ];
  }),

  /**
   * @property {String} primaryKeyField - Primary Key Field used so we know what to use as default field for operators
   */
  primaryKeyField: readOnly('requestFragment.dimension.primaryKeyFieldName'),

  /**
   * @property {?Boolean} showFields - Whether to show the field chooser in the filter builder
   */
  showFields: readOnly('filter.operator.showFields'),

  /**
   * @property {Array} fields - List of fields that a user can choose from
   */
  fields: computed('requestFragment.dimension', function() {
    let fields = get(this, 'requestFragment.dimension.fields');
    return fields ? fields.map(field => field.name) : ['id', 'desc'];
  }),

  /**
   * @property {Object} filter
   * @override
   */
  filter: computed('requestFragment.{operator,dimension,rawValues.[],field}', function() {
    let dimensionFragment = get(this, 'requestFragment'),
      operatorId = get(dimensionFragment, 'operator'),
      operator = A(get(this, 'supportedOperators')).findBy('id', operatorId);

    return {
      subject: get(dimensionFragment, 'dimension'),
      operator,
      values: get(dimensionFragment, 'rawValues'),
      validations: get(dimensionFragment, 'validations'),
      field: get(dimensionFragment, 'field')
    };
  }),

  actions: {
    /**
     * Sets the field on the filter.
     * @param {String} field - field to set
     */
    setField(field) {
      const changeSet = { field };
      this.onUpdateFilter(changeSet);
    }
  }
});
