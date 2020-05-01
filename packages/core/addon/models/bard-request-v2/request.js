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
  sorts: [
    validator('has-many'),
    validator('collection', {
      collection: true,
      message: 'Sorts must be a collection'
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
  sorts;
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
      clonedRequest = this.toJSON();

    return store.createFragment('bard-request-v2/request', {
      filters: clonedRequest.filters.map(filter => {
        const newFilter = store.createFragment('bard-request-v2/fragments/filter', {
          field: filter.field,
          parameters: filter.parameters,
          type: filter.type,
          operator: filter.operator,
          values: filter.values
        });
        newFilter.source = clonedRequest.dataSource;
        return newFilter;
      }),
      columns: clonedRequest.columns.map(column => {
        const newColumn = store.createFragment('bard-request-v2/fragments/column', {
          field: column.field,
          parameters: column.parameters,
          type: column.type,
          alias: column.alias
        });
        newColumn.source = clonedRequest.dataSource;
        return newColumn;
      }),
      table: clonedRequest.table,
      sorts: clonedRequest.sorts.map(sort => {
        const newSort = store.createFragment('bard-request-v2/fragments/sort', {
          field: sort.field,
          parameters: sort.parameters,
          type: sort.type,
          direction: sort.direction
        });
        newSort.source = clonedRequest.dataSource;
        return newSort;
      }),
      limit: clonedRequest.limit,
      requestVersion: clonedRequest.requestVersion,
      dataSource: clonedRequest.dataSource
    });
  }
}
