/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import type { FilterOperator } from '@yavin/client/request';
import type { ServiceOptions } from 'navi-data/services/navi-dimension';
import type { TaskGenerator } from 'ember-concurrency';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';

export type DimensionFilter = {
  operator: FilterOperator;
  values: (string | number)[];
};

export default interface NaviDimensionAdapter extends EmberObject {
  /**
   * Get all values for a dimension column
   * @param dimension - requested dimension
   * @param options - adapter options
   */
  all(dimension: DimensionColumn, options?: ServiceOptions): TaskGenerator<unknown>;

  /**
   * Get dimension value for a filter predicate
   * @param dimension - requested dimension
   * @param predicate - filter criteria
   * @param options - adapter options
   */
  find(dimension: DimensionColumn, predicate: DimensionFilter[], options?: ServiceOptions): TaskGenerator<unknown>;

  /**
   * Get dimension values for a search string
   * @param dimension - requested dimension
   * @param query - query string
   * @param options - adapter options
   */
  search(dimension: DimensionColumn, query: string, options?: ServiceOptions): TaskGenerator<unknown>;
}
