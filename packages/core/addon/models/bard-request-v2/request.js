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

export default Fragment.extend(Validations, {
  filters: fragmentArray('bard-request-v2/fragments/filter', { defaultValue: [] }),
  columns: fragmentArray('bard-request-v2/fragments/column', { defaultValue: [] }),
  table: attr('string'),
  sort: fragmentArray('bard-request-v2/fragments/sort', { defaultValue: [] }),
  limit: attr('number'),
  requestVersion: attr('string', { defaultValue: '2.0' }),
  dataSource: attr('string', { defaultValue: getDefaultDataSourceName() }),

  /**
   * @method clone
   * @returns {Fragment} copy of this fragment
   */
  clone() {
    const { store } = this,
      clonedRequest = this.toJSON();

    return store.createFragment('bard-request-v2/request', {
      filters: clonedRequest.filters.map(filter =>
        store.createFragment('bard-request-v2/fragments/filter', {
          field: filter.field,
          parameters: filter.parameters,
          operator: filter.operator,
          values: filter.values
        })
      ),
      columns: clonedRequest.columns.map(column =>
        store.createFragment('bard-request-v2/fragments/column', {
          field: column.field,
          parameters: column.parameters,
          type: column.type,
          alias: column.alias
        })
      ),
      table: clonedRequest.table,
      sort: clonedRequest.sort.map(sort =>
        store.createFragment('bard-request-v2/fragments/sort', {
          field: sort.field,
          parameters: sort.parameters,
          direction: sort.direction
        })
      ),
      limit: clonedRequest.limit,
      requestVersion: clonedRequest.requestVersion,
      dataSource: clonedRequest.dataSource
    });
  }
});
