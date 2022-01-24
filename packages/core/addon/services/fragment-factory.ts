/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service, { inject as service } from '@ember/service';
import type ColumnMetadataModel from 'navi-data/models/metadata/column';
import type { ColumnType } from 'navi-data/models/metadata/column';
import type Store from '@ember-data/store';
import type ColumnFragment from '../models/request/column';
import type FilterFragment from '../models/request/filter';
import type SortFragment from '../models/request/sort';
import type { Parameters, SortDirection } from 'navi-data/adapters/facts/interface';

export default class FragmentFactory extends Service {
  @service
  declare store: Store;

  /**
   * Builds a request v2 column fragment given meta data object.
   * @param meta - The metadata object to use as field to build this fragment from
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param alias - optional alias for this column
   */
  createColumnFromMeta(
    columnMetadata: ColumnMetadataModel,
    parameters: Parameters = {},
    alias?: string
  ): ColumnFragment {
    const { id: field, metadataType: type, source } = columnMetadata;
    return this.createColumn(type, source, field, parameters, alias);
  }

  /**
   * Builds a request v2 column fragment and applies the appropriate meta data
   * @param type - metric, dimension or timeDimension
   * @param dataSource - datasource or namespace for metadata lookups
   * @param field - field name, if dimension includes field `dimension.id`
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param alias - optional alias for this column
   */
  createColumn(
    type: ColumnType,
    dataSource: string,
    field: string,
    parameters: Parameters = {},
    alias?: string
  ): ColumnFragment {
    return this.store.createFragment('request/column', {
      field,
      type,
      parameters,
      alias,
      source: dataSource,
    });
  }

  /**
   * Builds a request v2 filter fragment given meta data object.
   * @param meta - meta data object to build this filter from
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param operator - operator to pass in: 'contains, in, notnull etc'
   * @param values - array of values to filter by
   */
  createFilterFromMeta(
    columnMetadata: ColumnMetadataModel,
    parameters: FilterFragment['parameters'],
    operator: FilterFragment['operator'],
    values: FilterFragment['values']
  ): FilterFragment {
    const { id: field, metadataType: type, source } = columnMetadata;
    return this.createFilter(type, source, field, parameters, operator, values);
  }

  /**
   * Builds a request v2 filter fragment and applies the appropriate meta data
   * @param type - metric, dimension or timeDimension
   * @param dataSource - datasource or namespace for metadata lookups
   * @param field - field name, if dimension includes field `dimension.id`
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param operator - operator to pass in: 'contains, in, notnull etc'
   * @param values - array of values to filter by
   */
  createFilter(
    type: FilterFragment['type'],
    dataSource: FilterFragment['source'],
    field: FilterFragment['field'],
    parameters: FilterFragment['parameters'],
    operator: FilterFragment['operator'],
    values: FilterFragment['values']
  ): FilterFragment {
    return this.store.createFragment('request/filter', {
      field,
      parameters,
      type,
      operator,
      values,
      source: dataSource,
    });
  }

  /**
   * Builds a request v2 sort fragment given meta data object.
   * @param meta - meta data object to build this filter from
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param direction  - `desc` or `asc`
   */
  createSortFromMeta(
    columnMetadata: ColumnMetadataModel,
    parameters: Record<string, string> = {},
    direction: 'asc' | 'desc'
  ): SortFragment {
    const { id: field, metadataType: type, source } = columnMetadata;
    return this.createSort(type, source, field, parameters, direction);
  }

  /**
   * Builds a request v2 sort fragment and applies the appropriate meta data
   * @param type - metric, dimension or timeDimension
   * @param dataSource - datasource or namespace for metadata lookups
   * @param field - field name, if dimension includes field `dimension.id`
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param direction - `desc` or `asc`
   */
  createSort(
    type: ColumnType,
    dataSource: string,
    field: string,
    parameters: Parameters = {},
    direction: SortDirection
  ): SortFragment {
    return this.store.createFragment('request/sort', {
      field,
      parameters,
      type,
      direction,
      source: dataSource,
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'fragment-factory': FragmentFactory;
  }
}
