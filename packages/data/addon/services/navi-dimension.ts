/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { task } from 'ember-concurrency';
import { getOwner } from '@ember/application';
import { getDataSource } from 'navi-data/utils/adapter';
import { taskFor } from 'ember-concurrency-ts';
import type { TaskGenerator } from 'ember-concurrency';
import type NaviDimensionSerializer from 'navi-data/serializers/dimensions/interface';
import type NaviDimensionAdapter from 'navi-data/adapters/dimensions/interface';
import type { DimensionFilter } from 'navi-data/adapters/dimensions/interface';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import CARDINALITY_SIZES from 'navi-data/utils/enums/cardinality-sizes';
import SearchUtils from 'navi-data/utils/search';
import { A } from '@ember/array';

export type ServiceOptions = {
  timeout?: number;
  page?: number;
  perPage?: number;
  clientId?: string;
};

type CacheRecord = {
  time: number; // the last time this record was accessed
  dimResponse: NaviDimensionResponse; // the actual records
};

export default class NaviDimensionService extends Service {
  /**
   * @property {Object} _dimensionCache - local cache for dimensions
   */
  _dimensionCache: Record<string, CacheRecord> = {};

  /**
   * keeps the cache from getting too large by:
   *   1) removing items over an hour old from the cache
   *   2) removing the oldest item in the cache (if cache is over 5 entries)
   */
  private _trimCache(): void {
    const cache = this._dimensionCache;
    const now = Date.now();
    let oldestDate = now;
    let oldestId = '';
    for (const [id, record] of Object.entries(cache)) {
      // remove stale items (over an hour old)
      if (now - record.time > 60 * 60 * 1000) {
        delete cache[id];
      }
      // find oldest non-stale item
      else if (record.time < oldestDate) {
        oldestDate = record.time;
        oldestId = id;
      }
    }
    // if cache still too large, remove oldest item
    if (Object.keys(cache).length > 5) {
      delete cache[oldestId];
    }
  }

  /**
   * adds a given dimResponse/cacheId combo to the cache
   * @param cacheId string (result of the _getCacheId function)
   * @param dimResponse NaviDimensionResponse
   */
  private _addToCache(cacheId: string, dimResponse: NaviDimensionResponse) {
    if (!cacheId) {
      return;
    }
    const cache = this._dimensionCache;
    cache[cacheId] = {
      time: Date.now(),
      dimResponse: dimResponse,
    };
    this._trimCache();
  }

  /**
   * fetches a given cacheId's CacheRecord from the _dimensionCache, returns undefined if not in cache
   * @param cacheId string (result of the _getCacheId function)
   * @returns CacheRecord | undefined
   */
  private _checkCache(cacheId: string): NaviDimensionResponse | undefined {
    if (!cacheId) {
      return;
    }
    const cache = this._dimensionCache;
    let cacheResponse = cache[cacheId];
    let results = undefined;

    // for 'search' type requests, check for cached 'all' requests
    if (!cacheResponse) {
      const [dimId, query] = cacheId.split('.');
      if (query) {
        cacheResponse = cache[dimId];
        if (cacheResponse) {
          // sort the results
          let searchResults = SearchUtils.searchNaviDimensionRecords(A(cacheResponse.dimResponse.values), query);
          results = {
            values: searchResults.map((val) => val.record),
          };
        }
      }
    } else {
      results = cacheResponse.dimResponse;
    }

    // if something was found, update record access time
    if (cacheResponse) {
      cacheResponse.time = Date.now();
    }

    this._trimCache();
    return results as NaviDimensionResponse;
  }

  /**
   * generates the _dimensionCache ID matching a particular dimensions call
   * @param dimension DimensionColumn
   * @returns string
   */
  private _getCacheId(dimension: DimensionColumn, query?: string): string {
    let cacheId = dimension.columnMetadata.id;
    const params = dimension.parameters;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        cacheId = cacheId + '(' + key + ':' + value + ')';
      }
    }
    if (query) {
      cacheId = cacheId + '.' + query;
    }
    return cacheId;
  }

  /**
   * @param dataSourceType
   * @returns  adapter instance for type
   */
  private adapterFor(dataSourceType: string): NaviDimensionAdapter {
    return getOwner(this).lookup(`adapter:dimensions/${dataSourceType}`);
  }

  /**
   * @param dataSourceType
   * @returns serializer instance for type
   */
  private serializerFor(dataSourceType: string): NaviDimensionSerializer {
    return getOwner(this).lookup(`serializer:dimensions/${dataSourceType}`);
  }

  /**
   * Get all values for a dimension column, paginating through results as needed.
   * @param dimension - requested dimension
   * @param options - method options
   */
  @task *all(dimension: DimensionColumn, options: ServiceOptions = {}): TaskGenerator<NaviDimensionResponse> {
    // check cache
    const cacheId = this._getCacheId(dimension);
    const cacheResponse = this._checkCache(cacheId);
    if (cacheResponse) {
      return cacheResponse;
    }

    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const adapter = this.adapterFor(dataSourceType);
    const serializer = this.serializerFor(dataSourceType);
    let moreResults = true;
    let paginationOptions: Pick<ServiceOptions, 'page' | 'perPage'> = {};
    let values: NaviDimensionModel[] = [];
    while (moreResults) {
      const mergedOptions = { ...options, ...paginationOptions };
      const payload: unknown = yield taskFor(adapter.all).perform(dimension, mergedOptions);
      const normalized = serializer.normalize(dimension, payload, mergedOptions);

      values.push(...normalized.values);

      if (normalized.meta?.pagination) {
        // Pagination data found, check if more results are available
        const { currentPage, numberOfResults, rowsPerPage } = normalized.meta.pagination;
        const currentCount = currentPage * rowsPerPage;
        moreResults = currentCount < numberOfResults;
        paginationOptions = {
          page: currentPage + 1,
          perPage: rowsPerPage,
        };
      } else {
        // No pagination data, assume all values were fetched
        moreResults = false;
      }
    }
    const results = NaviDimensionResponse.create({ values });

    // if small, cache results
    if (dimension.columnMetadata.cardinality === CARDINALITY_SIZES[0]) {
      this._addToCache(cacheId, results);
    }
    return results;
  }

  /**
   * Get dimension value for a filter predicate
   * @param dimension - requested dimension
   * @param predicate - filter criteria
   * @param options - method options
   */
  @task *find(
    dimension: DimensionColumn,
    predicate: DimensionFilter[],
    options: ServiceOptions = {}
  ): TaskGenerator<NaviDimensionResponse> {
    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const adapter = this.adapterFor(dataSourceType);
    const payload: unknown = yield taskFor(adapter.find).perform(dimension, predicate, options);
    return this.serializerFor(dataSourceType).normalize(dimension, payload, options);
  }

  /**
   * Get dimension values for a search string
   * @param dimension - requested dimension
   * @param query - query string
   * @param options - method options
   */
  @task *search(
    dimension: DimensionColumn,
    query: string,
    options: ServiceOptions = {}
  ): TaskGenerator<NaviDimensionResponse> {
    // check the cache
    const cacheId = this._getCacheId(dimension, query);
    const cacheResponse = this._checkCache(cacheId);
    if (cacheResponse) {
      return cacheResponse;
    }

    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const adapter = this.adapterFor(dataSourceType);
    const payload: unknown = yield taskFor(adapter.search).perform(dimension, query, options);
    const results = this.serializerFor(dataSourceType).normalize(dimension, payload, options);

    // cache if small
    if (dimension.columnMetadata.cardinality === CARDINALITY_SIZES[0]) {
      this._addToCache(cacheId, results);
    }
    return results;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'navi-dimension': NaviDimensionService;
  }
}
