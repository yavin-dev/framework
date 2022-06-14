/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the Bard dimension model.
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { A as arr } from '@ember/array';
import { serializeFilters } from '@yavin/client/plugins/fili/adapter/facts';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type { TaskGenerator } from 'ember-concurrency';
import type { Filter } from '@yavin/client/request';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type NaviDimensionAdapter from '@yavin/client/adapters/dimensions/interface';
import type { DimensionFilter, Options } from '@yavin/client/adapters/dimensions/interface';
import type DimensionMetadataModel from '@yavin/client/models/metadata/dimension';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import { searchDimensionRecords } from '@yavin/client/utils/search';
import CARDINALITY_SIZES from '@yavin/client/utils/enums/cardinality-sizes';
import type YavinClientService from 'navi-data/services/yavin-client';

const SUPPORTED_FILTER_OPERATORS = ['in', 'notin', 'startswith', 'contains'];

const SEARCH_TIMEOUT = 30000;

const CLIENT_ID = 'UI';

type LegacyAdapterOptions = {
  dataSourceName: string;
  clientId?: string;
  timeout?: number;
  page?: number;
  perPage?: number;
};

export type FiliDimensionResponse = {
  rows: Record<string, string>[];
  meta?: Record<string, unknown>;
};

type SearchUtilResult = {
  relevance: number;
  record: Record<string, string>;
};

export const DefaultField = 'id';

export default class BardDimensionAdapter extends EmberObject implements NaviDimensionAdapter {
  /**
   * @property namespace
   */
  namespace = 'v1';

  @service
  private ajax: TODO;

  @service
  private naviMetadata!: NaviMetadataService;

  @service
  declare yavinClient: YavinClientService;

  /**
   * @property {Array} supportedFilterOperators - List of supported filter operations
   */
  supportedFilterOperators = SUPPORTED_FILTER_OPERATORS;

  _buildUrl(dimension: DimensionColumn, path = 'values') {
    const host = this.yavinClient.clientConfig.configHost({ dataSourceName: dimension.columnMetadata.source });
    const { namespace } = this;
    const { id: dimensionId } = dimension.columnMetadata;
    return `${host}/${namespace}/dimensions/${dimensionId}/${path}/`;
  }

  _buildFilterQuery(
    dimension: DimensionColumn,
    andQueries: DimensionFilter[]
  ): Record<string, string | number | boolean> {
    const requestV2Filters: Filter[] = andQueries.map((query) => {
      const field = dimension.parameters?.field || DefaultField;
      return {
        type: 'dimension',
        field: dimension.columnMetadata.id,
        parameters: { field },
        operator: query.operator || 'in',
        values: query.values || [],
      };
    });

    const dataSourceConfig = this.yavinClient.clientConfig.getDataSource<'bard'>(dimension.columnMetadata.source);
    return andQueries.length ? { filters: serializeFilters(requestV2Filters, dataSourceConfig) } : {};
  }

  _searchDimensions(dimensions: FiliDimensionResponse, query: string): FiliDimensionResponse {
    const results = searchDimensionRecords(arr(dimensions.rows), query, 5000, 1) as SearchUtilResult[];
    return {
      rows: results.map((result: SearchUtilResult) => result.record),
      ...(dimensions.meta ? { meta: dimensions.meta } : {}),
    };
  }

  _find(
    url: string,
    data: Record<string, string | number | boolean>,
    options: Options
  ): Promise<FiliDimensionResponse> {
    let clientId = CLIENT_ID;
    let timeout = SEARCH_TIMEOUT;

    if (options) {
      // Support custom clientId header
      if (options.clientId) {
        clientId = options.clientId;
      }

      // Support custom timeout
      if (options.timeout) {
        timeout = options.timeout;
      }

      // pagination
      if (options.page && options.perPage) {
        data.page = options.page;
        data.perPage = options.perPage;
      }
    }

    return this.ajax.request(url, {
      xhrFields: {
        withCredentials: true,
      },
      beforeSend(xhr: TODO) {
        xhr.setRequestHeader('clientid', clientId);
      },
      crossDomain: true,
      data,
      timeout,
    });
  }

  all(dimension: DimensionColumn, options: Options = {}): Promise<unknown> {
    return taskFor(this.allTask).perform(dimension, options);
  }

  find(dimension: DimensionColumn, predicate: DimensionFilter[], options: Options = {}): Promise<unknown> {
    return taskFor(this.findTask).perform(dimension, predicate, options);
  }
  search(dimension: DimensionColumn, query: string, options: Options = {}): Promise<unknown> {
    return taskFor(this.searchTask).perform(dimension, query, options);
  }

  @task *allTask(dimension: DimensionColumn, options: Options = {}): TaskGenerator<FiliDimensionResponse> {
    return yield taskFor(this.findTask).perform(dimension, [], options);
  }

  @task *findById(
    dimensionName: string,
    value: string,
    options: LegacyAdapterOptions
  ): TaskGenerator<FiliDimensionResponse> {
    const columnMetadata = this.naviMetadata.getById(
      'dimension',
      dimensionName,
      options.dataSourceName
    ) as DimensionMetadataModel;
    return yield taskFor(this.findTask).perform({ columnMetadata }, [{ operator: 'in', values: [value] }], options);
  }

  @task *findTask(
    dimension: DimensionColumn,
    predicate: DimensionFilter[] = [],
    options: Options = {}
  ): TaskGenerator<FiliDimensionResponse> {
    const url = this._buildUrl(dimension, undefined);
    const data = predicate ? this._buildFilterQuery(dimension, predicate) : {};
    return yield this._find(url, data, options);
  }

  @task *searchTask(
    dimension: DimensionColumn,
    query: string,
    options: Options = {}
  ): TaskGenerator<FiliDimensionResponse> {
    const { source, cardinality } = dimension.columnMetadata;
    const filiOptions = this.yavinClient.clientConfig.getDataSource<'bard'>(source).options;
    if (cardinality === CARDINALITY_SIZES[0]) {
      const all = yield taskFor(this.allTask).perform(dimension);
      return this._searchDimensions(all, query);
    } else if (filiOptions?.enableDimensionSearch) {
      const url = this._buildUrl(dimension, 'search');
      const data: Record<string, string> = query ? { query } : {};
      const results = yield this._find(url, data, options);
      return this._searchDimensions(results, query); //TODO: Remove researching dimensions, when bard search ordering improves
    } else {
      const results = yield taskFor(this.findTask).perform(
        dimension,
        [
          {
            operator: 'contains',
            values: [query],
          },
        ],
        options
      );
      return this._searchDimensions(results, query);
    }
  }
}
