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
 * to use, give it a unique string (cacheKey) and whatever you want stored alongside that key
 * returns only exact matches
 */
export default class Cache<T> {
  private _maxCacheSize;
  private _cacheTimeout;
  private _cache;

  /**
   * @param {number} maxCacheSize - the maximum number of items that can be stored in the cache (default 10)
   * @param {number} cacheTimeout - the maximum amount of milliseconds a record should be allowed to stay in the cache (default 1 hour)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(maxCacheSize = 10, cacheTimeout = 60 * 60 * 1000) {
    this._maxCacheSize = maxCacheSize;
    this._cacheTimeout = cacheTimeout;
    this._cache = new Map<string, CacheRecord<T>>();
  }

  /**
   * removes items that were created too long ago from the cache
   */
  private _removeStaleItems(): void {
    const cache = this._cache;
    const now = Date.now();
    cache.forEach((value: CacheRecord<T>, key: string) => {
      if (now - value.creationTime >= this._cacheTimeout) {
        cache.delete(key);
      }
    });
  }

  /**
   * makes space for a given cacheKey by removing the least recently accessed item if cache is at max size
   * @param {string} cacheKey - the unique identifier you want to make space for in the cache
   * @returns {number} the number of items removed from the cache
   */
  private _makeSpaceFor(cacheKey: string): number {
    const cache = this._cache;
    let removedCount = 0;
    if (!cache.has(cacheKey) && cache.size === this._maxCacheSize) {
      let oldestDate = Date.now();
      let oldestKey = '';
      cache.forEach((value: CacheRecord<T>, key: string) => {
        if (value.lastAccessed < oldestDate) {
          oldestDate = value.lastAccessed;
          oldestKey = key;
        }
      });
      cache.delete(oldestKey);

      removedCount = removedCount + 1;
    }
    return removedCount;
  }

  /**
   * removes all items from the cache
   */
  clear(): void {
    this._cache.clear();
  }

  /**
   * checks to see if a specific key is in the cache
   * @param cacheKey - the unique identifier you want to check if is in the cache
   * @returns {boolean} boolean indicating presence of given key in cache
   */
  has(cacheKey: string): boolean {
    this._removeStaleItems();
    return this._cache.has(cacheKey);
  }

  /**
   * adds a given key/value pair to the cache
   * @param {string} cacheKey - the unique identifier associated with the thing you're putting into the cache
   * @param {any} records - the thing you want to store in the cache
   * @returns void
   */
  setItem(cacheKey: string, records: T): void {
    this._removeStaleItems();
    if (!cacheKey) {
      return;
    }

    this._makeSpaceFor(cacheKey);
    const cache = this._cache;
    cache.set(cacheKey, { creationTime: Date.now(), lastAccessed: Date.now(), records });
  }

  /**
   * looks for and returns a specific record in the cache
   * @param {string} cacheKey - the unique identifier associated with the thing you're looking for
   * @param {(string) => T} fallbackFn - a function that will run if the cache misses (results added to cache)
   * @returns the thing you're looking for (or undefined, if it's not in the cache)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getItem(cacheKey: string, fallbackFn?: (args?: any) => T): T | undefined {
    this._removeStaleItems();
    if (!cacheKey) {
      return;
    }

    const cache = this._cache;
    let cacheResponse = cache.get(cacheKey);
    let results = undefined;

    // if something was found, update record access time
    if (cacheResponse) {
      cacheResponse.lastAccessed = Date.now();
      results = cacheResponse.records;
    }
    // if nothing was found, call the fallback function
    else if (fallbackFn) {
      results = fallbackFn(cacheKey);
      this.setItem(cacheKey, results);
    }

    return results;
  }

  /**
   * removes a given key/record pair from the cache
   * @param {string} cacheKey - the unique identifier you want to remove from the cache
   */
  removeItem(cacheKey: string): void {
    this._cache.delete(cacheKey);
  }
}
