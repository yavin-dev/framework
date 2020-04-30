/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { validator, buildValidations } from 'ember-cp-validations';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';

const Validations = buildValidations({
  filters: [
    validator('has-many'),
    validator('collection', {
      collection: true,
      message: 'Filters must be a collection'
    })
  ],
  columns: [
    validator('has-many'),
    validator('collection', {
      collection: true,
      message: 'Columns must be a collection'
    }),
    validator('length', {
      min: 1,
      message: 'At least one column should be selected'
    })
  ],
  table: validator('presence', {
    presence: true,
    message: 'Table is invalid or unavailable'
  }),
  sort: [
    validator('has-many'),
    validator('collection', {
      collection: true,
      message: 'Sort must be a collection'
    })
  ]
});

export default class Request extends Fragment.extend(Validations) {
  @fragmentArray('bard-request-v2/fragments/filter', {
    defaultValue: []
  })
  filters;
  @fragmentArray('bard-request-v2/fragments/column', {
    defaultValue: []
  })
  columns;
  @attr('string') table;
  @fragmentArray('bard-request-v2/fragments/sort', {
    defaultValue: []
  })
  sort;
  @attr('number') limit;
  @attr('string', {
    defaultValue: '2.0'
  })
  requestVersion;
  @attr('string', {
    defaultValue: getDefaultDataSourceName()
  })
  dataSource;

  /**
   * @method clone
   * @returns {Fragment} copy of this fragment
   */
  clone() {
    const { store } = this,
      clonedRequest = this.toJSON(),
      typeMap = this._buildTypeMap();

    return store.createFragment('bard-request-v2/request', {
      filters: clonedRequest.filters.map(filter => {
        const newFilter = store.createFragment('bard-request-v2/fragments/filter', {
          field: filter.field,
          parameters: filter.parameters,
          operator: filter.operator,
          values: filter.values
        });
        newFilter.applyMeta(typeMap[newFilter.lookupField], clonedRequest.dataSource);
        return newFilter;
      }),
      columns: clonedRequest.columns.map(column => {
        const newColumn = store.createFragment('bard-request-v2/fragments/column', {
          field: column.field,
          parameters: column.parameters,
          type: column.type,
          alias: column.alias
        });
        newColumn.applyMeta(typeMap[newColumn.lookupField], clonedRequest.dataSource);
        return newColumn;
      }),
      table: clonedRequest.table,
      sort: clonedRequest.sort.map(sort => {
        const newSort = store.createFragment('bard-request-v2/fragments/sort', {
          field: sort.field,
          parameters: sort.parameters,
          direction: sort.direction
        });
        newSort.applyMeta(typeMap[newSort.lookupField], clonedRequest.dataSource);
        return newSort;
      }),
      limit: clonedRequest.limit,
      requestVersion: clonedRequest.requestVersion,
      dataSource: clonedRequest.dataSource
    });
  }

  /**
   * Builds field -> type map for request
   * @returns {object<BaseFragment>}
   */
  _buildTypeMap() {
    const typeMap = this.columns.reduce(
      (types, col) => {
        if (!types[col.lookupField]) {
          return Object.assign({}, types, { [col.lookupField]: col.type });
        }
        return types;
      },
      { dateTime: 'dimension' }
    );

    [...this.filters.toArray(), ...this.sort.toArray()].forEach(col => {
      if (!typeMap[col.lookupField] && col.columnMetaType) {
        typeMap[col.lookupField] = col.columnMetaType;
      }
    });
    return typeMap;
  }
}
