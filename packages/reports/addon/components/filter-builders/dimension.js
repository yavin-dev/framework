/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterBuilders::Dimension
 *       @requestFragment={{this.request.filters.firstObject}}
 *   />
 */
import { A as arr } from '@ember/array';
import { get, computed, action } from '@ember/object';
import BaseFilterBuilderComponent from './base';
import { readOnly } from '@ember/object/computed';
import layout from 'navi-reports/templates/components/filter-builders/dimension';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DimensionFilterBuilderComponent extends BaseFilterBuilderComponent {
  /**
   * @property {Object} requestFragment - filter fragment from request model
   */
  requestFragment = undefined;

  /**
   * @property {Array} supportedOperators
   * @override
   */
  @computed('requestFragment.dimension')
  get supportedOperators() {
    let storageStrategy = get(this, 'requestFragment.dimension.storageStrategy'),
      inputComponent = 'filter-values/dimension-select';

    //Allow free form input of dimension values when dimension's storageStrategy is 'none'
    if (storageStrategy === 'none') {
      inputComponent = 'filter-values/multi-value-input';
    }

    return [
      { id: 'in', name: 'Equals', valuesComponent: inputComponent },
      { id: 'notin', name: 'Not Equals', valuesComponent: inputComponent },
      {
        id: 'null',
        name: 'Is Empty',
        valuesComponent: 'filter-values/null-input'
      },
      {
        id: 'notnull',
        name: 'Is Not Empty',
        valuesComponent: 'filter-values/null-input'
      },
      {
        id: 'contains',
        name: 'Contains',
        valuesComponent: 'filter-values/multi-value-input',
        showFields: true
      }
    ];
  }

  /**
   * @property {String} primaryKeyField - Primary Key Field used so we know what to use as default field for operators
   */
  @readOnly('requestFragment.columnMetadata.primaryKeyFieldName') primaryKeyField;

  /**
   * @property {?Boolean} showFields - Whether to show the field chooser in the filter builder
   */
  @readOnly('filter.operator.showFields') showFields;

  /**
   * @property {Array} fields - List of fields that a user can choose from
   */
  @computed('requestFragment.columnMetadata')
  get fields() {
    let fields = this.requestFragment.columnMetadata.fields;
    return fields ? fields.map(field => field.name) : ['id', 'desc'];
  }

  /**
   * @property {Object} filter
   * @override
   */
  @computed('requestFragment.{operator,dimension,values,validations,field}')
  get filter() {
    let dimensionFragment = this.requestFragment,
      operatorId = dimensionFragment.operator,
      operator = arr(this.supportedOperators).findBy('id', operatorId);

    return {
      subject: dimensionFragment,
      operator,
      values: dimensionFragment.values,
      validations: dimensionFragment.validations,
      field: dimensionFragment.parameters.field
    };
  }

  /**
   * @property {String} field - chosen field (if not primaryKeyField)
   */
  @computed('showFields', 'primaryKeyField', 'filter.field')
  get field() {
    const {
      showFields,
      primaryKeyField,
      filter: { field }
    } = this;

    return showFields && field !== primaryKeyField ? field : null;
  }

  /**
   * Sets the field on the filter.
   * @param {String} field - field to set
   */
  @action
  setField(field) {
    const parameters = {
      ...this.requestFragment.parameters,
      field
    };
    this.onUpdateFilter({ parameters });
  }
}

export default DimensionFilterBuilderComponent;
