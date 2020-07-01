/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { validator, buildValidations } from 'ember-cp-validations';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { isEqual } from 'lodash-es';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import Interval from 'navi-core/utils/classes/interval';
import { A as arr } from '@ember/array';
import { assert } from '@ember/debug';
import { canonicalizeMetric } from 'navi-data/utils/metric';

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

  @service fragmentFactory;

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
          values: filter.values,
          source: filter.source || clonedRequest.dataSource
        });
        return newFilter;
      }),
      columns: clonedRequest.columns.map(column => {
        const newColumn = store.createFragment('bard-request-v2/fragments/column', {
          field: column.field,
          parameters: column.parameters,
          type: column.type,
          alias: column.alias,
          source: column.source || clonedRequest.dataSource
        });
        return newColumn;
      }),
      table: clonedRequest.table,
      sorts: clonedRequest.sorts.map(sort => {
        const newSort = store.createFragment('bard-request-v2/fragments/sort', {
          field: sort.field,
          parameters: sort.parameters,
          type: sort.type,
          direction: sort.direction,
          source: sort.source || clonedRequest.dataSource
        });
        return newSort;
      }),
      limit: clonedRequest.limit,
      requestVersion: clonedRequest.requestVersion,
      dataSource: clonedRequest.dataSource
    });
  }

  @computed('columns.[]')
  get timeGrainColumn() {
    return this.columns.find(column => column.type === 'time-dimension' && column.field === 'dateTime');
  }

  @computed('timeGrainColumn')
  get timeGrain() {
    return this.timeGrainColumn?.parameters?.grain;
  }

  @computed('filters.[]')
  get dateTimeFilter() {
    return this.filters.find(filter => filter.type === 'time-dimension' && filter.field === 'dateTime');
  }

  @computed('dateTimeFilter.values')
  get interval() {
    const values = this.dateTimeFilter?.values;
    return values?.length ? Interval.parseFromStrings(values[0], values[1]) : undefined;
  }

  addColumn({ type, dataSource, field, parameters, alias }) {
    this.columns.pushObject(this.fragmentFactory.createColumn(type, dataSource, field, parameters, alias));
  }

  addColumnFromMeta(columnMetadataModel, parameters) {
    const { columns } = this;
    let columnExists = false;

    if (!featureFlag('enableRequestPreview')) {
      //check if columns with same meta and params already exists
      let existingColumns = columns.filter(column => column.columnMeta === columnMetadataModel);

      if (parameters && columnMetadataModel.hasParameters) {
        existingColumns = existingColumns.filter(column => isEqual(column.parameters, parameters));
      }

      if (existingColumns.length) {
        columnExists = true;
      }
    }

    if (!columnExists) {
      this.columns.pushObject(this.fragmentFactory.createColumnFromMeta(columnMetadataModel, parameters));
    }
  }

  addColumnFromMetaWithParams(columnMetadataModel, parameters = {}) {
    this.addColumnFromMeta(columnMetadataModel, {
      ...(columnMetadataModel.getDefaultParameters?.() || {}),
      ...parameters
    });
  }

  removeColumn(column) {
    this.columns.removeFragment(column);
  }

  removeColumnByMeta(columnMetadataModel, parameters) {
    let columnsToRemove = this.columns.filter(column => column.columnMeta === columnMetadataModel);

    if (parameters) {
      columnsToRemove = columnsToRemove.filter(column => isEqual(column.parameters, parameters));
    }

    columnsToRemove.forEach(column => this.removeColumn(column));
  }

  updateColumnParameters(column, parameters) {
    column.updateParameters(parameters);
  }

  updateTimeGrain(newTimeGrain) {
    const { timeGrainColumn } = this;

    if (!timeGrainColumn) {
      this.addColumn({
        type: 'time-dimension',
        dataSource: this.dataSource,
        field: 'dateTime',
        parameters: { grain: newTimeGrain }
      });
    }

    if (this.timeGrain !== newTimeGrain) {
      this.updateColumnParameters(this.timeGrainColumn, { grain: newTimeGrain });
    }
  }

  updateInterval(newInterval) {
    const { dateTimeFilter } = this;
    const { start, end } = newInterval.asStrings();
    set(dateTimeFilter, 'values', [start, end]);
  }

  _doAddFilter(filterToAdd) {
    const filterExists = this.filters.find(filter => isEqual(filter.serialize(), filterToAdd.serialize()));

    if (!filterExists) {
      this.filters.pushObject(filterToAdd);
    }
  }

  //TODO: handle valueParam values vs rawValues
  addFilter({ type, columnMetadataModel, field, parameters, operator, values }) {
    const filterToAdd =
      type && field
        ? this.fragmentFactory.createFilter(type, columnMetadataModel.source, field, parameters, operator, arr(values))
        : this.fragmentFactory.createFilterFromMeta(columnMetadataModel, parameters, operator, arr(values));

    this._doAddFilter(filterToAdd);
  }

  removeFilter(filter) {
    this.filters.removeFragment(filter);
  }

  addSort({ type, dataSource, field, parameters, direction }) {
    const canonicalName = canonicalizeMetric({
      metric: field,
      parameters
    });
    const sortExists = this.sorts.findBy('canonicalName', canonicalName);

    assert(`Metric: ${canonicalName} cannot have multiple sorts on it`, !sortExists);

    this.sorts.pushObject(this.fragmentFactory.createSort(type, dataSource, field, parameters, direction));
  }

  addDateTimeSort(direction) {
    this.sorts.unshiftObject(
      this.fragmentFactory.createSort('time-dimension', this.dataSource, 'dateTime', {}, direction)
    );
  }

  addSortByMetricName(metricName, direction) {
    const metricColumn = this.columns.find(column => column.type === 'metric' && column.canonicalName === metricName);

    assert(`Metric with canonical name "${metricName}" was not found in the request`, metricColumn);

    this.addSort({
      type: 'metric',
      dataSource: this.dataSource,
      field: metricColumn.field,
      parameters: metricColumn.parameters,
      direction
    });
  }

  removeSort(sort) {
    return this.sorts.removeFragment(sort);
  }

  removeSortByMeta(metricMetadataModel) {
    const sortsToRemove = this.sorts.filter(sort => sort.columnMeta === metricMetadataModel);
    sortsToRemove.forEach(sort => this.removeSort(sort));
  }

  removeSortByMetricName(metricName) {
    const sort = this.sorts.find(sort => sort.type === 'metric' && sort.canonicalName === metricName);
    return this.removeSort(sort);
  }

  removeSortWithParams(metricMetadataModel, parameters) {
    return this.removeSortByMetricName(
      canonicalizeMetric({
        metric: metricMetadataModel.id,
        parameters
      })
    );
  }
}
