/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type NaviDimensionResponse from '../../models/navi-dimension-response.js';
import type { DimensionColumn } from '../../models/metadata/dimension.js';
import type { DimensionFilter } from '../../adapters/dimensions/interface.js';
import type { Options } from '../../adapters/dimensions/interface.js';

export default interface DimensionService {
  /**
   * Get all values for a dimension column, paginating through results as needed.
   * @param dimension - requested dimension
   * @param options - method options
   */
  all(dimension: DimensionColumn, options?: Options): Promise<NaviDimensionResponse>;

  /**
   * Get dimension value for a filter predicate
   * @param dimension - requested dimension
   * @param predicate - filter criteria
   * @param options - method options
   */
  find(dimension: DimensionColumn, predicate: DimensionFilter[], options?: Options): Promise<NaviDimensionResponse>;

  /**
   * Get dimension values for a search string
   * @param dimension - requested dimension
   * @param query - query string
   * @param options - method options
   */
  search(dimension: DimensionColumn, query: string, options?: Options): Promise<NaviDimensionResponse>;
}

declare module './registry' {
  export default interface ServiceRegistry {
    'navi-dimension': DimensionService;
  }
}
