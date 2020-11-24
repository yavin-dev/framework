/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service, { inject as service } from '@ember/service';
import Store from 'ember-data/store';
import { ColumnMetadata, ColumnType } from 'navi-data/models/metadata/column';
//@ts-ignore
import ColumnFragment from '../models/bard-request-v2/fragments/column';
//@ts-ignore
import FilterFragment from '../models/bard-request-v2/fragments/filter';
//@ts-ignore
import SortFragment from '../models/bard-request-v2/fragments/sort';
import { SortDirection } from 'navi-data/adapters/facts/interface';

export default class FragmentFactory extends Service {
  @service store!: Store;

  /**
   * Builds a request v2 column fragment given meta data object.
   * @param meta - The metadata object to use as field to build this fragment from
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param alias - optional alias for this column
   */
  createColumnFromMeta(columnMetadata: ColumnMetadata, parameters: Dict<string> = {}, alias?: string): ColumnFragment {
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
    parameters: Dict<string> = {},
    alias?: string
  ): ColumnFragment {
    return this.store.createFragment('bard-request-v2/fragments/column', {
      field,
      type,
      parameters,
      alias,
      source: dataSource
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
    columnMetadata: ColumnMetadata,
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
    return this.store.createFragment('bard-request-v2/fragments/filter', {
      field,
      parameters,
      type,
      operator,
      values,
      source: dataSource
    });
  }

  /**
   * Builds a request v2 sort fragment given meta data object.
   * @param meta - meta data object to build this filter from
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param direction  - `desc` or `asc`
   */
  createSortFromMeta(
    columnMetadata: ColumnMetadata,
    parameters: Dict<string> = {},
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
    parameters: Dict<string> = {},
    direction: SortDirection
  ): SortFragment {
    return this.store.createFragment('bard-request-v2/fragments/sort', {
      field,
      parameters,
      type,
      direction,
      source: dataSource
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'fragment-factory': FragmentFactory;
  }
}
