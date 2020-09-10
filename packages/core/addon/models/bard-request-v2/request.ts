/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
//@ts-ignore
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { validator, buildValidations } from 'ember-cp-validations';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
//@ts-ignore
import { isEqual } from 'lodash-es';
//@ts-ignore
import Interval from 'navi-core/utils/classes/interval';
import { assert } from '@ember/debug';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { RequestV2, SortDirection, ColumnType } from 'navi-data/adapters/facts/interface';
import FragmentFactory from 'navi-core/services/fragment-factory';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import Store from '@ember-data/store';
import MetricMetadataModel from 'navi-data/models/metadata/metric';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import FragmentArray from 'ember-data-model-fragments/FragmentArray';
import { ColumnMetadataModels } from './fragments/base';
import { Parameters } from 'navi-data/adapters/facts/interface';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import SortFragment from './fragments/sort';
import { TableMetadata } from 'navi-data/addon/models/metadata/table';

type BaseLiteral = {
  type: ColumnType;
  source: string;
  field: string;
  parameters: Parameters;
};

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

export default class RequestFragment extends Fragment.extend(Validations) implements RequestV2 {
  @fragmentArray('bard-request-v2/fragments/filter', { defaultValue: () => [] })
  filters!: FragmentArray<FilterFragment>;

  @fragmentArray('bard-request-v2/fragments/column', { defaultValue: () => [] })
  columns!: FragmentArray<ColumnFragment>;

  @attr('string')
  table!: string;

  @fragmentArray('bard-request-v2/fragments/sort', { defaultValue: () => [] })
  sorts!: FragmentArray<SortFragment>;

  @attr('number')
  limit!: number | null;

  @attr('string', { defaultValue: '2.0' })
  requestVersion!: '2.0';

  @attr('string', { defaultValue: getDefaultDataSourceName() })
  dataSource!: string;

  @service
  private fragmentFactory!: FragmentFactory;

  @service
  private naviMetadata!: NaviMetadataService;

  /**
   * @property store - Store service with fragments
   */
  store!: Store;

  /**
   * @method clone
   * @returns {Fragment} copy of this fragment
   */
  clone(this: RequestFragment) {
    const { store } = this;
    const clonedRequest = this.toJSON() as RequestV2;

    return store.createFragment('bard-request-v2/request', {
      filters: clonedRequest.filters.map(filter => {
        const newFilter = store.createFragment('bard-request-v2/fragments/filter', {
          field: filter.field,
          parameters: filter.parameters,
          type: filter.type,
          operator: filter.operator,
          values: filter.values,
          source: clonedRequest.dataSource
        });
        return newFilter;
      }),
      columns: clonedRequest.columns.map(column => {
        const newColumn = store.createFragment('bard-request-v2/fragments/column', {
          field: column.field,
          parameters: column.parameters,
          type: column.type,
          alias: column.alias,
          source: clonedRequest.dataSource
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
          source: clonedRequest.dataSource
        });
        return newSort;
      }),
      limit: clonedRequest.limit,
      requestVersion: clonedRequest.requestVersion,
      dataSource: clonedRequest.dataSource
    });
  }

  @computed('table', 'dataSource')
  get tableMetadata() {
    return this.naviMetadata.getById('table', this.table, this.dataSource);
  }

  /**
   * @property {ColumnFragment[]} metricColumns - The metric columns
   */
  @computed('columns.[]')
  get metricColumns(): ColumnFragment[] {
    return this.columns.filter(column => column.type === 'metric');
  }

  @computed('columns.[]')
  get dimensionColumns(): ColumnFragment[] {
    return this.columns.filter(column => column.type === 'timeDimension' || column.type === 'dimension');
  }

  @computed('filters.[]')
  get metricFilters(): FilterFragment[] {
    return this.filters.filter(filter => filter.type === 'metric');
  }

  /**
   * @property {ColumnFragment[]} dimensionFilters - The dimension and timeDimension filters
   */
  @computed('filters.[]')
  get dimensionFilters(): FilterFragment[] {
    return this.filters.filter(filter => filter.type === 'timeDimension' || filter.type === 'dimension');
  }

  /**
   * @property {ColumnFragment} timeGrainColumn - The column containing the dateTime timeDimension
   */
  @computed('columns.[]')
  get timeGrainColumn() {
    return this.columns.filter(column => column.type === 'timeDimension')[0];
  }

  /**
   * @property {string} timeGrain - The grain parameter of the column containing the dateTime timeDimension
   */
  @computed('timeGrainColumn.parameters.grain')
  get timeGrain() {
    return this.timeGrainColumn?.parameters?.grain;
  }

  /**
   * @property {FilterFragment} dateTimeFilter - The filter on the dateTime dimension
   */
  @computed('filters.[]')
  get dateTimeFilter() {
    return this.filters.filter(filter => filter.type === 'timeDimension')[0];
  }

  /**
   * @property {Interval|undefined} interval - The interval to filter the dateTime for
   */
  @computed('dateTimeFilter.values')
  get interval() {
    const values = this.dateTimeFilter?.values;
    return values?.length ? Interval.parseFromStrings(`${values[0]}`, `${values[1]}`) : undefined;
  }

  /**
   * Sets the table of the request
   */
  setTableByMetadata(table: TableMetadata) {
    this.set('table', table.id);
    this.set('dataSource', table.source);
  }

  /**
   * Adds the column to the request
   */
  addColumn({ type, source, field, parameters, alias }: BaseLiteral & { alias?: string }): ColumnFragment {
    return this.columns.pushObject(this.fragmentFactory.createColumn(type, source, field, parameters, alias));
  }

  /**
   * Adds a new column with the parameters
   */
  addColumnFromMeta(columnMetadataModel: ColumnMetadataModels, parameters: Parameters): ColumnFragment {
    return this.columns.pushObject(this.fragmentFactory.createColumnFromMeta(columnMetadataModel, parameters));
  }

  /**
   * Adds a column with it's default parameters
   */
  addColumnFromMetaWithParams(columnMetadataModel: ColumnMetadataModels, parameters: Parameters = {}): ColumnFragment {
    return this.addColumnFromMeta(columnMetadataModel, {
      ...(columnMetadataModel.getDefaultParameters?.() || {}),
      ...parameters
    });
  }

  /**
   * Removes an exact column from the request
   * @param {ColumnFragment} column - the fragment of the column to remove
   */
  removeColumn(column: ColumnFragment) {
    this.columns.removeFragment(column);
  }

  /**
   * Removes a column based on it's metadata and the given parameters
   * @param {ColumnMetadata} columnMetadataModel - the metadata for the column
   * @param {object} parameters - the parameters to search for to be removed
   */
  removeColumnByMeta(columnMetadataModel: ColumnMetadataModels, parameters: Parameters) {
    let columnsToRemove = this.columns.filter(column => column.columnMetadata === columnMetadataModel);

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
  renameColumn(column: ColumnFragment, alias: string) {
    set(column, 'alias', alias);
  }

  /**
   * Updates the parameters of a column
   * @param {ColumnFragment} column - the fragment of the column to update
   * @param {object} parameters - the parameters to be updated and their values
   */
  updateColumnParameters(column: ColumnFragment, parameters: Parameters) {
    column.updateParameters(parameters);
  }

  updateTimeGrain() {
    throw new Error('TimeGrain is no longer a top level property');
  }

  updateInterval() {
    throw new Error('TimeGrain is no longer a top level property');
  }

  addDateTimeSort() {
    throw new Error('DateTime is no longer a top level property');
  }

  //TODO: handle valueParam values vs rawValues
  /**
   * Adds a filter to the request
   * @param {object} filter - the filter to add
   */
  addFilter({
    type,
    source,
    field,
    parameters,
    operator,
    values
  }: BaseLiteral & { operator: string; values: (string | number)[] }) {
    this.filters.pushObject(this.fragmentFactory.createFilter(type, source, field, parameters, operator, values));
  }

  /**
   * Removes a filter by it's fragment
   * @param {FilterFragment} filter - the filter to remove
   */
  removeFilter(filter: FilterFragment) {
    this.filters.removeFragment(filter);
  }

  /**
   * Adds a sort to the request if it does not exist
   * @param {SortFragment} sort - the sort to add to the request
   */
  addSort({ type, source, field, parameters, direction }: BaseLiteral & { direction: SortDirection }) {
    const canonicalName = canonicalizeMetric({
      metric: field,
      parameters
    });
    const sortExists = this.sorts.findBy('canonicalName', canonicalName);

    assert(`Metric: ${canonicalName} cannot have multiple sorts on it`, !sortExists);

    this.sorts.pushObject(this.fragmentFactory.createSort(type, source, field, parameters, direction));
  }

  /**
   * Adds a sort based on the metric name with the direction
   * @param {string} metricName - the canonical name of the metric
   * @param {string} direction - the direction of the sort
   */
  addSortByMetricName(metricName: string, direction: SortDirection) {
    const metricColumn = this.columns.find(
      column => column.type === 'metric' && column.canonicalName === metricName
    ) as ColumnFragment;

    assert(`Metric with canonical name "${metricName}" was not found in the request`, metricColumn);

    this.addSort({
      type: 'metric',
      source: this.dataSource,
      field: metricColumn.field,
      parameters: metricColumn.parameters,
      direction
    });
  }

  /**
   * Removes a sort from the request
   * @param {SortFragment} sort - the fragment of the sort to remove
   */
  removeSort(sort: SortFragment) {
    this.sorts.removeFragment(sort);
  }

  /**
   * Removes all sorts on this metric
   * @param {ColumnMetadata} metricMetadataModel - the metadata of the metric to remove sorts for
   */
  //TODO create metric type
  removeSortByMeta(metricMetadataModel: ColumnMetadataModels) {
    const sortsToRemove = this.sorts.filter(sort => sort.columnMetadata === metricMetadataModel);
    sortsToRemove.forEach(sort => this.removeSort(sort));
  }

  /**
   * Removes a sort if it exists by the given metric name
   * @param {string} metricName - the canonical name of the metric to remove sorts for
   */
  removeSortByMetricName(metricName: string) {
    const sort = this.sorts.find(sort => sort.type === 'metric' && sort.canonicalName === metricName);
    if (sort) {
      this.removeSort(sort);
    }
  }

  /**
   * Removes a sort if it exists by the given metric with the given parameters
   * @param {ColumnMetadata} metricMetadataModel - the   metadata of the metric to remove sorts
   * @param {object} parameters - the parameters applied to the metric
   */
  removeSortWithParams(metricMetadataModel: MetricMetadataModel, parameters: Parameters) {
    this.removeSortByMetricName(
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
  reorderColumn(column: ColumnFragment, index: number) {
    this.columns.removeFragment(column);
    this.columns.insertAt(index, column);
  }
}
