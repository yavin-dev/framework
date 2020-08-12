/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Parameters } from '../facts/interface';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';

export type AdapterOptions = {
  clientId?: string;
  timeout?: number;
  page?: number;
  perPage?: number;
};

export type DimensionFilter = {
  operator: string;
  values: string[];
};

export interface DimensionColumn {
  columnMetadata: DimensionMetadataModel;
  parameters?: Parameters;
}

export default interface NaviDimensionAdapter {
  /**
   * Get all values for a dimension column
   * @param dimension - requested dimension
   * @param options - adapter options
   */
  all(dimension: DimensionColumn, options?: AdapterOptions): Promise<unknown>;

  /**
   * Get dimension value for a filter predicate
   * @param dimension - requested dimension
   * @param predicate - filter criteria
   * @param options - adapter options
   */
  find(dimension: DimensionColumn, predicate: DimensionFilter[], options?: AdapterOptions): Promise<unknown>;

  /**
   * Get dimension values for a search string
   * @param dimension - requested dimension
   * @param query - query string
   * @param options - adapter options
   */
  search(dimension: DimensionColumn, query: string, options?: AdapterOptions): Promise<unknown>;
}
