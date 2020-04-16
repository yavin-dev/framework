/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service, { inject as service } from '@ember/service';
import Store from 'ember-data/store';
import Column from 'navi-data/models/metadata/column';
import Metric from 'navi-data/models/metadata/metric';
import ColumnFragment from '../models/bard-request-v2/fragments/column';
import FilterFragment from '../models/bard-request-v2/fragments/filter';
import SortFragment from '../models/bard-request-v2/fragments/sort';

interface StoreWithFragment extends Store {
  createFragment(fragmentName: string, attributes: object): ColumnFragment | FilterFragment | SortFragment;
}
export default class FragmentFactory extends Service {
  @service store!: StoreWithFragment;

  /**
   * Builds a request v2 column fragment given meta data object.
   * @param meta - The metadata object to use as field to build this fragment from
   * @param parameters - parameters to attach to column, if none pass empty object `{}`
   * @param alias - optional alias for this column
   * @param dimensionField - dimension field if passing in a dimension `id` or `description` for example
   */
  createColumnFromMeta(meta: Column, parameters: object = {}, alias?: string, dimensionField?: string): ColumnFragment {
    const type = meta instanceof Metric ? 'metric' : 'dimension';
    const column = this.store.createFragment('bard-request-v2/fragments/column', {
      field: dimensionField ? `${meta.id}.${dimensionField}` : meta.id,
      type,
      parameters,
      alias
    }) as ColumnFragment;
    column.meta = meta;
    return column;
  }

  /**
   * Builds a request v2 column fragment and applies the appropriate meta data
   * @param type - metric or dimension
   * @param dataSource - datasource or namespace for metadata lookups
   * @param field - field name, if dimension includes field `dimension.id`
   * @param parameters - parameters to attach to column, if noen pass empty object `{}`
   * @param alias - optional alias for this column
   */
  createColumn(
    type: 'metric' | 'dimension',
    dataSource: string,
    field: string,
    parameters: object = {},
    alias?: string
  ): ColumnFragment {
    const column = this.store.createFragment('bard-request-v2/fragments/column', {
      field,
      type,
      parameters,
      alias
    }) as ColumnFragment;
    column.applyMeta(type, dataSource);
    return column;
  }

  /**
   * Builds a request v2 filter fragment given meta data object.
   * @param meta - meta data object to build this filter from
   * @param parameters - parameters to attach to column, if noen pass empty object `{}`
   * @param operator - operator to pass in: 'contains, in, notnull etc'
   * @param values - array of values to filter by
   * @param dimensionField - dimension field if passing in a dimension `id` or `description` for example
   */
  createFilterFromMeta(
    meta: Column,
    parameters: object = {},
    operator: string,
    values: Array<string | number>,
    dimensionField?: string
  ): FilterFragment {
    const filter = this.store.createFragment('bard-request-v2/fragments/filter', {
      field: dimensionField ? `${meta.id}.${dimensionField}` : meta.id,
      parameters,
      operator,
      values
    }) as FilterFragment;
    filter.meta = meta;
    return filter;
  }

  /**
   * Builds a request v2 filter fragment and applies the appropriate meta data
   * @param type - metric or dimension
   * @param dataSource - datasource or namespace for metadata lookups
   * @param field - field name, if dimension includes field `dimension.id`
   * @param parameters - parameters to attach to column, if noen pass empty object `{}`
   * @param operator - operator to pass in: 'contains, in, notnull etc'
   * @param values - array of values to filter by
   */
  createFilter(
    type: 'metric' | 'dimension',
    dataSource: string,
    field: string,
    parameters: object = {},
    operator: string,
    values: Array<string | number>
  ): FilterFragment {
    const filter = this.store.createFragment('bard-request-v2/fragments/filter', {
      field,
      parameters,
      operator,
      values
    }) as FilterFragment;

    filter.applyMeta(type, dataSource);
    return filter;
  }

  /**
   * Builds a request v2 sort fragment given meta data object.
   * @param meta - meta data object to build this filter from
   * @param parameters - parameters to attach to column, if noen pass empty object `{}`
   * @param direction  - `desc` or `asc`
   * @param dimensionField - dimension field if passing in a dimension `id` or `description` for example
   */
  createSortFromMeta(
    meta: Column,
    parameters: object = {},
    direction: 'asc' | 'desc',
    dimensionField?: string
  ): SortFragment {
    const sort = this.store.createFragment('bard-request-v2/fragments/sort', {
      field: dimensionField ? `${meta.id}.${dimensionField}` : meta.id,
      parameters,
      direction
    }) as SortFragment;
    sort.meta = meta;
    return sort;
  }

  /**
   * Builds a request v2 sort fragment and applies the appropriate meta data
   * @param type - metric or dimension
   * @param dataSource - datasource or namespace for metadata lookups
   * @param field - field name, if dimension includes field `dimension.id`
   * @param parameters - parameters to attach to column, if noen pass empty object `{}`
   * @param direction - `desc` or `asc`
   */
  createSort(
    type: 'metric' | 'dimension',
    dataSource: string,
    field: string,
    parameters: object = {},
    direction: 'asc' | 'desc'
  ): SortFragment {
    const sort = this.store.createFragment('bard-request-v2/fragments/sort', {
      field,
      parameters,
      direction
    }) as SortFragment;
    sort.applyMeta(type, dataSource);
    return sort;
  }
}

declare module '@ember/service' {
  interface Registry {
    'fragment-factory': FragmentFactory;
  }
}
