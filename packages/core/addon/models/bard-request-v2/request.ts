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
import Interval from 'navi-data/utils/classes/interval';
import { assert } from '@ember/debug';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { RequestV2, SortDirection } from 'navi-data/adapters/facts/interface';
import FragmentFactory from 'navi-core/services/fragment-factory';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import Store from '@ember-data/store';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import FragmentArray from 'ember-data-model-fragments/FragmentArray';
import { ColumnMetadataModels } from './fragments/base';
import { Parameters } from 'navi-data/adapters/facts/interface';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import SortFragment from './fragments/sort';
import TableMetadataModel, { TableMetadata } from 'navi-data/models/metadata/table';
import { ColumnType } from 'navi-data/models/metadata/column';
import { Grain } from 'navi-data/utils/date';

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
   * @returns copy of this fragment
   */
  clone(this: RequestFragment): RequestFragment {
    const { store } = this;
    const clonedRequest = this.toJSON() as RequestFragment; //POJO form of RequestFragment;

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
          cid: column.cid, // Needs to be the same for visualization column references
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
  get tableMetadata(): TableMetadataModel | undefined {
    return this.naviMetadata.getById('table', this.table, this.dataSource);
  }

  /**
   * @property metricColumns - The metric columns
   */
  @computed('columns.[]')
  get metricColumns(): ColumnFragment<'metric'>[] {
    return this.columns.filter(column => column.type === 'metric') as ColumnFragment<'metric'>[];
  }

  /**
   * @property dimensionColumns - The dimension and time dimension columns
   */
  @computed('columns.[]')
  get dimensionColumns(): ColumnFragment<'dimension' | 'timeDimension'>[] {
    return this.columns.filter(
      column => column.type === 'timeDimension' || column.type === 'dimension'
    ) as ColumnFragment<'dimension' | 'timeDimension'>[];
  }

  /**
   * @property metricFilters - The metric filters
   */
  @computed('filters.[]')
  get metricFilters(): FilterFragment[] {
    return this.filters.filter(filter => filter.type === 'metric');
  }

  /**
   * @property dimensionFilters - The dimension and timeDimension filters
   */
  @computed('filters.[]')
  get dimensionFilters(): FilterFragment[] {
    return this.filters.filter(filter => filter.type === 'timeDimension' || filter.type === 'dimension');
  }

  /**
   * @property timeGrainColumn - The column containing the dateTime timeDimension
   */
  @computed('columns.[]')
  get timeGrainColumn(): ColumnFragment<'timeDimension'> | undefined {
    const timeCols = this.columns.filter(({ type }) => type === 'timeDimension') as ColumnFragment<'timeDimension'>[];
    return timeCols[0];
  }

  @computed('columns.[]')
  get nonTimeDimensions(): ColumnFragment[] {
    return this.columns.filter(c => c.type === 'dimension');
  }

  /**
   * @property timeGrain - The grain parameter of the column containing the dateTime timeDimension
   */
  @computed('timeGrainColumn.parameters.grain')
  get timeGrain(): Grain | undefined {
    return this.timeGrainColumn?.parameters?.grain as Grain;
  }

  /**
   * @property dateTimeFilter - The filter on the dateTime dimension
   */
  @computed('filters.[]')
  get dateTimeFilter(): FilterFragment | undefined {
    return this.filters.filter(filter => filter.type === 'timeDimension')[0];
  }

  /**
   * @property interval - The interval to filter the dateTime for
   */
  @computed('dateTimeFilter.values')
  get interval(): Interval | undefined {
    const { operator, values = [] } = this.dateTimeFilter || {};
    const [start, end] = values;
    if (operator === 'bet' && start && end) {
      return Interval.parseFromStrings(`${start}`, `${end}`);
    }
    return undefined;
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
   * Adds a column with it's default parameters
   */
  addColumnFromMetaWithParams(columnMetadataModel: ColumnMetadataModels, parameters: Parameters = {}): ColumnFragment {
    return this.columns.pushObject(this.fragmentFactory.createColumnFromMeta(columnMetadataModel, parameters));
  }

  /**
   * Removes an exact column from the request
   * @param column - the fragment of the column to remove
   */
  removeColumn(column: ColumnFragment) {
    this.columns.removeFragment(column);
  }

  /**
   * Removes a column based on it's metadata and the given parameters
   * @param columnMetadataModel - the metadata for the column
   * @param parameters - the parameters to search for to be removed
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
   * @param column - the fragment of the column to remove
   * @param alias - the new alias for the column
   */
  renameColumn(column: ColumnFragment, alias: ColumnFragment['alias']) {
    set(column, 'alias', alias);
  }

  /**
   * Updates the parameters of a column
   * @param column - the fragment of the column to update
   * @param parameters - the parameters to be updated and their values
   */
  updateColumnParameters(column: ColumnFragment, parameters: Parameters) {
    column.updateParameters(parameters);
  }

  /**
   * Adds a filter to the request
   * @param filter - the filter to add
   */
  addFilter({
    type,
    field,
    parameters,
    operator,
    values
  }: BaseLiteral & { operator: FilterFragment['operator']; values: FilterFragment['values'] }) {
    this.filters.pushObject(
      this.fragmentFactory.createFilter(type, this.dataSource, field, parameters, operator, values)
    );
  }

  /**
   * Removes a filter by it's fragment
   * @param filter - the filter to remove
   */
  removeFilter(filter: FilterFragment) {
    this.filters.removeFragment(filter);
  }

  /**
   * Adds a sort to the request if it does not exist
   * @param sort - the sort to add to the request
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
   * Removes a sort from the request
   * @param sort - the fragment of the sort to remove
   */
  removeSort(sort: SortFragment) {
    this.sorts.removeFragment(sort);
  }

  /**
   * Moves the given column to the index, shifting everything >= index by one position
   * @param column - the column fragment that is being moved
   * @param index - the index to move the selected column
   */
  reorderColumn(column: ColumnFragment, index: number) {
    this.columns.removeFragment(column);
    this.columns.insertAt(index, column);
  }
}
