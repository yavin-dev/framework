/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

type CacheRecord<T> = {
  creationTime: number; // the time this record was created
  lastAccessed: number; // the last time this record was accessed
  records: T; // the actual records
};

/**
 * a cache
 * to use, give it a unique string (cacheId) and whatever you want stored alongside that key
 * returns only exact matches
 */
export default class Cache<T> {
  private _maxCacheSize;
  private _cacheTimeout;
  private _cache: Record<string, CacheRecord<T>> = {};
  getCacheId;

  /**
   * @param {function (params:type) => string} cacheIdFunction - a function that returns unique strings associated with specific items in cache
   * @param {number} maxCacheSize - the maximum number of items that can be stored in the cache (default 10)
   * @param {number} cacheTimeout - the maximum amount of milliseconds a record should be allowed to stay in the cache (default 1 hour)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(cacheIdFunction: (args: any) => string, maxCacheSize = 10, cacheTimeout = 60 * 60 * 1000) {
    this.getCacheId = cacheIdFunction;
    this._maxCacheSize = maxCacheSize;
    this._cacheTimeout = cacheTimeout;
  }

  /**
   * removes items that were created too long ago from the cache
   */
  private _removeStaleItems(): void {
    const cache = this._cache;
    const now = Date.now();
    for (const [id, cacheResult] of Object.entries(cache)) {
      if (now - cacheResult.creationTime >= this._cacheTimeout) {
        delete cache[id];
      }
    }
  }

  /**
   * removes the least recently accessed items until cache is at or below max size
   */
  private _trimExtraItems(): void {
    const cache = this._cache;
    while (Object.keys(cache).length > this._maxCacheSize) {
      let oldestDate = Date.now();
      let oldestId = '';
      for (const [id, cacheResult] of Object.entries(cache)) {
        if (cacheResult.lastAccessed < oldestDate) {
          oldestDate = cacheResult.lastAccessed;
          oldestId = id;
        }
      }
      delete cache[oldestId];
    }
  }

  /**
   * adds a given key/value pair to the cache
   * @param {string} cacheId - the unique identifier associated with the thing you're putting into the cache (result of getCacheId function)
   * @param {any} records - the thing you want to store in the cache
   * @returns void
   */
  addToCache(cacheId: string, records: T): void {
    this._removeStaleItems();
    if (!cacheId) {
      return;
    }

    const cache = this._cache;
    cache[cacheId] = {
      creationTime: Date.now(),
      lastAccessed: Date.now(),
      records,
    };

    this._trimExtraItems();
  }

  /**
   * looks for and returns a specific record in the cache
   * @param cacheId - the unique identifier associated with the thing you're looking for (result of getCacheId function)
   * @returns the thing you're looking for (or undefined, if it's not in the cache)
   */
  checkCache(cacheId: string): T | undefined {
    this._removeStaleItems();
    if (!cacheId) {
      return;
    }

    const cache = this._cache;
    let cacheResponse = cache[cacheId];
    let results = undefined;

    // if something was found, update record access time
    if (cacheResponse) {
      cacheResponse.lastAccessed = Date.now();
      results = cacheResponse.records;
    }

    return results;
  }
}
