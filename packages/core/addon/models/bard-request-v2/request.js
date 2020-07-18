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

  /**
   * @property {ColumnFragment} timeGrainColumn - The column containing the dateTime time-dimension
   */
  @computed('columns.[]')
  get timeGrainColumn() {
    return this.columns.find(column => column.type === 'time-dimension' && column.field === 'dateTime');
  }

  /**
   * @property {string} timeGrain - The grain parameter of the column containing the dateTime time-dimension
   */
  @computed('timeGrainColumn')
  get timeGrain() {
    return this.timeGrainColumn?.parameters?.grain;
  }

  /**
   * @property {FilterFragment} dateTimeFilter - The filter on the dateTime dimension
   */
  @computed('filters.[]')
  get dateTimeFilter() {
    return this.filters.find(filter => filter.type === 'time-dimension' && filter.field === 'dateTime');
  }

  /**
   * @property {Interval|undefined} interval - The interval to filter the dateTime for
   */
  @computed('dateTimeFilter.values')
  get interval() {
    const values = this.dateTimeFilter?.values;
    return values?.length ? Interval.parseFromStrings(values[0], values[1]) : undefined;
  }

  /**
   * Adds the column to the request
   * @param {object} column - the column to add to the request
   */
  addColumn({ type, dataSource, field, parameters, alias }) {
    this.columns.pushObject(this.fragmentFactory.createColumn(type, dataSource, field, parameters, alias));
  }

  /**
   * If feature flag enableRequestPreview disabled, then adds up to 1 of the column, otherwise adds a new column
   * @param {ColumnMetadata} columnMetadataModel - the metadata for the column
   * @param {object} parameters - the parameters to apply to the column
   */
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

  /**
   * Adds a column with it's default parameters
   * @param {ColumnMetadata} columnMetadataModel - the metadata for the column
   * @param {object} parameters - the parameters to apply to the column
   */
  addColumnFromMetaWithParams(columnMetadataModel, parameters = {}) {
    this.addColumnFromMeta(columnMetadataModel, {
      ...(columnMetadataModel.getDefaultParameters?.() || {}),
      ...parameters
    });
  }

  /**
   * Removes an exact column from the request
   * @param {ColumnFragment} column - the fragment of the column to remove
   */
  removeColumn(column) {
    this.columns.removeFragment(column);
  }

  /**
   * Removes a column based on it's metadata and the given parameters
   * @param {ColumnMetadata} columnMetadataModel - the metadata for the column
   * @param {object} parameters - the parameters to search for to be removed
   */
  removeColumnByMeta(columnMetadataModel, parameters) {
    let columnsToRemove = this.columns.filter(column => column.columnMeta === columnMetadataModel);

    if (parameters) {
      columnsToRemove = columnsToRemove.filter(column => isEqual(column.parameters, parameters));
    }

    columnsToRemove.forEach(column => this.removeColumn(column));
  }

  /**
   * Renames an exact column from the request
   * @param {ColumnFragment} column - the fragment of the column to remove
   * @param {string} alias - the new alias for the column
   */
  renameColumn(column, alias) {
    set(column, 'alias', alias);
  }

  /**
   * Updates the parameters of a column
   * @param {ColumnFragment} column - the fragment of the column to update
   * @param {object} parameters - the parameters to be updated and their values
   */
  updateColumnParameters(column, parameters) {
    column.updateParameters(parameters);
  }

  /**
   * Makes the request have a dateTime time-dimension column with the given grain
   * @param {string} newTimeGrain - the new timegrain to use for the request
   */
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

  /**
   * Updates the values of the dateTime filter to the given interval
   * @param {Interval} newInterval - the new interval to apply to the request
   */
  updateInterval(newInterval) {
    const { dateTimeFilter } = this;
    const { start, end } = newInterval.asStrings();
    set(dateTimeFilter, 'values', [start, end]);
  }

  /**
   * Adds a filter only if it is unique
   * @param {FilterFragment} filterToAdd - the new filter to add
   */
  _doAddFilter(filterToAdd) {
    const filterExists = this.filters.find(filter => isEqual(filter.serialize(), filterToAdd.serialize()));

    if (!filterExists) {
      this.filters.pushObject(filterToAdd); //TODO: add to specific index?
    }
  }

  //TODO: handle valueParam values vs rawValues
  /**
   * Adds a filter to the request
   * @param {object} filter - the filter to add
   */
  addFilter({ type, dataSource, field, parameters, operator, values }) {
    this._doAddFilter(this.fragmentFactory.createFilter(type, dataSource, field, parameters, operator, values));
  }

  /**
   * Removes a filter by it's fragment
   * @param {FilterFragment} filter - the filter to remove
   */
  removeFilter(filter) {
    this.filters.removeFragment(filter);
  }

  /**
   * Adds a sort to the request if it does not exist
   * @param {SortFragment} sort - the sort to add to the request
   */
  addSort({ type, dataSource, field, parameters, direction }) {
    const canonicalName = canonicalizeMetric({
      metric: field,
      parameters
    });
    const sortExists = this.sorts.findBy('canonicalName', canonicalName);

    assert(`Metric: ${canonicalName} cannot have multiple sorts on it`, !sortExists);

    this.sorts.pushObject(this.fragmentFactory.createSort(type, dataSource, field, parameters, direction));
  }

  /**
   * Changes the direction for the dateTime column
   * @param {string} direction - the direction for the dateTime
   */
  addDateTimeSort(direction) {
    this.sorts.unshiftObject(
      this.fragmentFactory.createSort('time-dimension', this.dataSource, 'dateTime', {}, direction)
    );
  }

  /**
   * Adds a sort based on the metric name with the direction
   * @param {string} metricName - the canonical name of the metric
   * @param {string} direction - the direction of the sort
   */
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

  /**
   * Removes a sort from the request
   * @param {SortFragment} sort - the fragment of the sort to remove
   */
  removeSort(sort) {
    return this.sorts.removeFragment(sort);
  }

  /**
   * Removes all sorts on this metric
   * @param {ColumnMetadata} metricMetadataModel - the metadata of the metric to remove sorts for
   */
  removeSortByMeta(metricMetadataModel) {
    const sortsToRemove = this.sorts.filter(sort => sort.columnMeta === metricMetadataModel);
    sortsToRemove.forEach(sort => this.removeSort(sort));
  }

  /**
   * Removes a sort if it exists by the given metric name
   * @param {string} metricName - the canonical name of the metric to remove sorts for
   */
  removeSortByMetricName(metricName) {
    const sort = this.sorts.find(sort => sort.type === 'metric' && sort.canonicalName === metricName);
    return this.removeSort(sort);
  }

  /**
   * Removes a sort if it exists by the given metric with the given parameters
   * @param {ColumnMetadata} metricMetadataModel - the   metadata of the metric to remove sorts
   * @param {object} parameters - the parameters applied to the metric
   */
  removeSortWithParams(metricMetadataModel, parameters) {
    return this.removeSortByMetricName(
      canonicalizeMetric({
        metric: metricMetadataModel.id,
        parameters
      })
    );
  }

  /**
   * Moves the given column to the index, shifting everything >= index by one position
   * @param {ColumnFragment} column - the column fragment that is being moved
   * @param {number} index - the index to move the selected column
   */
  reorderColumn(column, index) {
    this.columns.removeFragment(column);
    this.columns.insertAt(index, column);
  }
}
