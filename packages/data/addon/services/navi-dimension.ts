/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { task } from 'ember-concurrency';
import { setOwner, getOwner } from '@ember/application';
import { getDataSource } from 'navi-data/utils/adapter';
import type { TaskGenerator } from 'ember-concurrency';
import type NaviDimensionSerializer from 'navi-data/serializers/dimensions/interface';
import type NaviDimensionAdapter from 'navi-data/adapters/dimensions/interface';
import type { DimensionFilter } from 'navi-data/adapters/dimensions/interface';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import NaviDimensionResponse from '@yavin/client/models/navi-dimension-response';
import NaviDimensionModel from '@yavin/client/models/navi-dimension';
import CARDINALITY_SIZES from '@yavin/client/utils/enums/cardinality-sizes';
import Cache from '@yavin/client/utils/classes/cache';
import { canonicalizeColumn } from '@yavin/client/utils/column';
import { searchNaviDimensionRecords } from 'navi-data/utils/search';
import { A } from '@ember/array';
import config from 'ember-get-config';
import type { Options as ServiceOptions } from 'navi-data/adapters/dimensions/interface';

const DIMENSION_CACHE = config.navi.dimensionCache;

type RequestType = 'all' | 'search' | 'find';

/**
 * a cache specifically for dimension results and queries
 * a normal cache follows logic "give me key X and I'll give you result Y"
 * dimension cache, however, is "give me query X and I'll format result Y from what I have"
 */
class DimensionCache extends Cache<NaviDimensionResponse> {
  constructor() {
    super(DIMENSION_CACHE.maxSize, DIMENSION_CACHE.timeoutMs);
  }

  // given a dimension column, return that column's cache key
  getCacheKey(dimension: DimensionColumn): string {
    const cannonicalName = canonicalizeColumn({
      field: dimension?.columnMetadata?.name,
      parameters: dimension.parameters,
    });
    return cannonicalName;
  }

  /**
   * pares an 'all' response down into a 'search' response
   * @param {NaviDimensionResponse} allResponse - the response with all of the dimensions
   * @param {string} query - the query that you're searching
   * @returns {NaviDimensionResponse | undefined} the search request dimension request
   */
  getSearchFromAll(allResponse: NaviDimensionResponse, query: string): NaviDimensionResponse {
    return new NaviDimensionResponse(
      getOwner(this).lookup('service:client-injector'),
      searchNaviDimensionRecords(A(allResponse.values), query)
    );
  }

  checkDimensionCache(
    requestType: RequestType,
    dimension: DimensionColumn,
    query?: string
  ): NaviDimensionResponse | undefined {
    let results = undefined;

    // check if all dimension results are stored in cache
    let cacheId = this.getCacheKey(dimension);
    let cacheResponse = this.getItem(cacheId);
    if (cacheResponse) {
      // if all results are in cache, but are looking for specific search
      if (requestType === 'search' && query) {
        results = this.getSearchFromAll(cacheResponse, query);
      } else {
        results = cacheResponse;
      }
    }

    return results;
  }

  addDimensionToCache(dimension: DimensionColumn, dimensionResults: NaviDimensionResponse) {
    let cacheId = this.getCacheKey(dimension);
    this.setItem(cacheId, dimensionResults);
  }
}

export default class NaviDimensionService extends Service {
  /**
   * @property {DimensionCache} _dimensionCache - local cache for dimensions
   */
  private _dimensionCache = new DimensionCache();

  constructor() {
    super(...arguments);
    setOwner(this._dimensionCache, getOwner(this));
  }

  clearCache(): void {
    this._dimensionCache.clear();
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
    const cacheResponse = this._dimensionCache.checkDimensionCache('all', dimension);
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
      const payload: unknown = yield adapter.all(dimension, mergedOptions);
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
    const results = new NaviDimensionResponse(getOwner(this).lookup('service:client-injector'), { values });

    // if small, cache results
    if (dimension.columnMetadata.cardinality === CARDINALITY_SIZES[0]) {
      this._dimensionCache.addDimensionToCache(dimension, results);
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
    const payload: unknown = yield adapter.find(dimension, predicate, options);
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
    // check cache
    const cacheResponse = this._dimensionCache.checkDimensionCache('search', dimension, query);
    if (cacheResponse) {
      return cacheResponse;
    }

    // if the dimension is small, query `all` instead for better caching
    if (dimension.columnMetadata.cardinality === CARDINALITY_SIZES[0]) {
      const allResponse = yield this.all(dimension, options);
      return this._dimensionCache.getSearchFromAll(allResponse, query);
    }

    const { type: dataSourceType } = getDataSource(dimension.columnMetadata.source);
    const adapter = this.adapterFor(dataSourceType);
    const payload: unknown = yield adapter.search(dimension, query, options);
    const results = this.serializerFor(dataSourceType).normalize(dimension, payload, options);

    return results;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'navi-dimension': NaviDimensionService;
  }
}
