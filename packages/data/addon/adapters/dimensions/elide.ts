/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the Elide dimension model.
 */
import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { assert, warn } from '@ember/debug';
import { QueryStatus } from '@yavin/client/adapters/facts/interface';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type { TaskGenerator } from 'ember-concurrency';
import type { AsyncQueryResponse } from '@yavin/client/adapters/facts/interface';
import type { FilterOperator } from '@yavin/client/request';
import type { Column, RequestV2 } from '@yavin/client/request';
import type NaviDimensionAdapter from './interface';
import type { DimensionFilter } from './interface';
import type { Options } from './interface';
import type ElideFactsAdapter from '../facts/elide';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import type ElideDimensionMetadataModel from '@yavin/client/models/metadata/elide/dimension';

type EnumFilter = (values: string[], filterValues: (string | number)[]) => (string | number)[];

const enumOperators: Partial<Record<FilterOperator, EnumFilter>> = {
  in: (values, filterValues) => values.filter((value) => filterValues.includes(value)),
  eq: (values, filterValues) => values.filter((value) => filterValues[0] === value),
  contains: (values, filterValues) =>
    values.filter((value) => `${value}`.toLowerCase().includes(`${filterValues[0]}`.toLowerCase())),
};

export default class ElideDimensionAdapter extends EmberObject implements NaviDimensionAdapter {
  /**
   * The elide fact adapter that will send asyncQuery requests for the dimension values
   */
  private factAdapter: ElideFactsAdapter = getOwner(this).lookup('adapter:facts/elide');

  @task private *formatEnumResponse(
    dimension: DimensionColumn,
    values: (string | number)[]
  ): TaskGenerator<AsyncQueryResponse> {
    const { columnMetadata } = dimension;
    const { tableId } = columnMetadata;
    const nodes = values.map((value) => `{"node":{"col0":"${value}"}}`);
    const responseBody = `{"data":{"${tableId}":{"edges":[${nodes.join(',')}]}}}`;

    if (columnMetadata.suggestionColumns.length > 0) {
      warn(`The dimension ${columnMetadata.name} has suggestion columns which are ignored because it has enum values`, {
        id: 'navi-dimensions-elide-ignored-suggestion-columns',
      });
    }

    return yield {
      asyncQuery: {
        edges: [
          {
            node: {
              id: 'enum query',
              query: 'n/a - enum',
              status: QueryStatus.COMPLETE,
              result: {
                responseBody,
                httpStatus: 200,
                contentLength: 0,
                recordCount: values.length,
              },
            },
          },
        ],
      },
    };
  }

  all(dimension: DimensionColumn, options: Options = {}): Promise<AsyncQueryResponse> {
    return taskFor(this.findTask).perform(dimension, [], options);
  }

  find(
    dimension: DimensionColumn,
    predicate: DimensionFilter[] = [],
    options: Options = {}
  ): Promise<AsyncQueryResponse> {
    return taskFor(this.findTask).perform(dimension, predicate, options);
  }

  search(dimension: DimensionColumn, query: string, options: Options = {}): Promise<AsyncQueryResponse> {
    return taskFor(this.searchTask).perform(dimension, query, options);
  }

  @task *findTask(
    dimension: DimensionColumn,
    predicate: DimensionFilter[] = [],
    options: Options = {}
  ): TaskGenerator<AsyncQueryResponse> {
    const columnMetadata = dimension.columnMetadata as ElideDimensionMetadataModel;

    return columnMetadata.hasEnumValues
      ? yield taskFor(this.findEnum).perform(dimension, predicate, options)
      : yield taskFor(this.findRequest).perform(dimension, predicate, options);
  }

  @task private *findEnum(
    dimension: DimensionColumn,
    predicate: DimensionFilter[],
    _options: Options
  ): TaskGenerator<AsyncQueryResponse> {
    const columnMetadata = dimension.columnMetadata as ElideDimensionMetadataModel;
    const { values } = columnMetadata;

    const filteredValues = predicate.reduce((values, predicate) => {
      const { operator, values: filterValues } = predicate;
      const filterFn = enumOperators[operator];
      assert(`Dimension enum filter operator is not supported: ${operator}`, filterFn);
      return filterFn(values, filterValues);
    }, values);

    return yield taskFor(this.formatEnumResponse).perform(dimension, filteredValues);
  }

  @task private *findRequest(
    dimension: DimensionColumn,
    predicate: DimensionFilter[] = [],
    options: Options = {}
  ): TaskGenerator<AsyncQueryResponse> {
    const { columnMetadata, parameters = {} } = dimension;
    const { valueSource, suggestionColumns } = columnMetadata as ElideDimensionMetadataModel;
    const { id, source, tableId } = valueSource;

    // Create a request with only one dimension and its appropriate filters
    const request: RequestV2 = {
      table: tableId || '',
      columns: [
        { field: id, parameters, type: 'dimension' },
        ...suggestionColumns.map<Column>(({ id, parameters = {} }) => ({ field: id, parameters, type: 'dimension' })),
      ],
      filters: predicate.map((pred) => ({
        field: id,
        parameters,
        type: 'dimension',
        operator: pred.operator,
        values: pred.values.map(String),
      })),
      sorts: [{ type: 'dimension', field: id, parameters, direction: 'asc' }],
      dataSource: source,
      limit: null,
      requestVersion: '2.0',
    };

    return yield this.factAdapter.fetchDataForRequest(request, options);
  }

  @task *searchTask(
    dimension: DimensionColumn,
    query: string,
    options: Options = {}
  ): TaskGenerator<AsyncQueryResponse> {
    const columnMetadata = dimension.columnMetadata as ElideDimensionMetadataModel;

    let predicate: DimensionFilter[];

    if (columnMetadata.hasEnumValues) {
      predicate = query.length
        ? [
            {
              operator: 'contains',
              values: [query],
            },
          ]
        : [];
    } else {
      predicate = query.length
        ? [
            {
              operator: 'ini',
              values: [`*${query}*`],
            },
          ]
        : [];
    }

    return columnMetadata.hasEnumValues
      ? yield taskFor(this.findEnum).perform(dimension, predicate, options)
      : yield taskFor(this.findRequest).perform(dimension, predicate, options);
  }
}
