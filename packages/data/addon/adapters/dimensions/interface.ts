/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { FilterOperator } from '@yavin/client/request';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';

export type DimensionFilter = {
  operator: FilterOperator;
  values: (string | number)[];
};

export type Options = {
  timeout?: number;
  page?: number;
  perPage?: number;
  clientId?: string;
};

export default interface NaviDimensionAdapter {
  /**
   * Get all values for a dimension column
   * @param dimension - requested dimension
   * @param options - adapter options
   */
  all(dimension: DimensionColumn, options?: Options): PromiseLike<unknown>;

  /**
   * Get dimension value for a filter predicate
   * @param dimension - requested dimension
   * @param predicate - filter criteria
   * @param options - adapter options
   */
  find(dimension: DimensionColumn, predicate: DimensionFilter[], options?: Options): PromiseLike<unknown>;

  /**
   * Get dimension values for a search string
   * @param dimension - requested dimension
   * @param query - query string
   * @param options - adapter options
   */
  search(dimension: DimensionColumn, query: string, options?: Options): PromiseLike<unknown>;
}
