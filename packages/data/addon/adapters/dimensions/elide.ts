/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the Elide dimension model.
 */
import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import NaviDimensionAdapter, { DimensionColumn, DimensionFilter } from './interface';
import { ServiceOptions } from 'navi-data/services/navi-dimension';
import { RequestV2 } from '../facts/interface';
import ElideFactsAdapter from '../facts/elide';

export default class ElideDimensionAdapter extends EmberObject implements NaviDimensionAdapter {
  /**
   * The elide fact adapter that will send asyncQuery requests for the dimension values
   */
  private factAdapter: ElideFactsAdapter = getOwner(this).lookup('adapter:facts/elide');

  all(dimension: DimensionColumn, options: ServiceOptions = {}): Promise<unknown> {
    return this.find(dimension, [], options);
  }

  find(dimension: DimensionColumn, predicate: DimensionFilter[] = [], options: ServiceOptions = {}): Promise<unknown> {
    const {
      columnMetadata: { id, source, tableId },
      parameters = {}
    } = dimension;

    // Create a request with only one dimension and its appropriate filters
    const request: RequestV2 = {
      table: tableId || '',
      columns: [{ field: id, parameters, type: 'dimension' }],
      filters: predicate.map(pred => ({
        field: id,
        parameters,
        type: 'dimension',
        operator: pred.operator,
        values: pred.values.map(String)
      })),
      sorts: [],
      dataSource: source,
      limit: null,
      requestVersion: '2.0'
    };

    return this.factAdapter.fetchDataForRequest(request, options);
  }

  search(dimension: DimensionColumn, query: string, options: ServiceOptions = {}): Promise<unknown> {
    const predicate: DimensionFilter[] = query.length
      ? [
          {
            operator: 'eq',
            values: [`*${query}*`]
          }
        ]
      : [];

    return this.find(dimension, predicate, options);
  }
}
