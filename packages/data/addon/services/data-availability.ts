import Service from '@ember/service';
import { hash, task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import Cache from 'navi-data/utils/classes/cache';
import config from 'ember-get-config';
import { getDataSource } from 'navi-data/utils/adapter';
import type { TaskGenerator, TaskInstance } from 'ember-concurrency';
import type { Moment } from 'moment';

export enum Status {
  OK,
  DELAYED,
  LATE,
  UNAVAILABLE,
}

export type FetchedAvailabilityResult = { status: Status.OK | Status.DELAYED | Status.LATE; date: Moment };
export type AvailabilityResult = FetchedAvailabilityResult | { status: Status.UNAVAILABLE; error: Error };
export type DataSourceAvailabilty = Record<string, AvailabilityResult>;

type Fetcher = () =>
  | FetchedAvailabilityResult
  | Promise<FetchedAvailabilityResult>
  | TaskInstance<FetchedAvailabilityResult>;

const AVAILABILITY_CACHE_MS = config.navi.availability?.cacheMs ?? 5 * 60 * 1000;

export default class DataAvailabilityService extends Service {
  _cache = new Cache<FetchedAvailabilityResult>((i) => i, 100, AVAILABILITY_CACHE_MS);
  fetchers = new Map<string, Fetcher>();

  registerDataSourceAvailability(dataSourceName: string, fetcher: Fetcher) {
    this.fetchers.set(dataSourceName, fetcher);
  }

  registeredDataSources(): Set<string> {
    return new Set([...this.fetchers.keys()]);
  }

  @task *fetchDataSource(dataSourceName: string): TaskGenerator<AvailabilityResult> {
    const cached = this._cache.getItem(dataSourceName);
    if (cached) {
      return cached;
    }
    const fetcher = this.fetchers.get(dataSourceName);
    if (!fetcher) {
      try {
        const dsConfig = getDataSource(dataSourceName);
        return {
          status: Status.UNAVAILABLE,
          error: new Error(`Data availability is not configured for the '${dsConfig.displayName}' datasource`),
        };
      } catch (error) {
        return { status: Status.UNAVAILABLE, error };
      }
    }
    try {
      const result: FetchedAvailabilityResult = yield fetcher();
      this._cache.setItem(dataSourceName, result);
      return result;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(`Availability Fetch failed`);
      return { status: Status.UNAVAILABLE, error };
    }
  }

  @task *fetchAll(dataSources = [...this.registeredDataSources()]): TaskGenerator<DataSourceAvailabilty> {
    const allPromises = Object.fromEntries(
      dataSources.map((dataSourceName) => [dataSourceName, taskFor(this.fetchDataSource).perform(dataSourceName)])
    );
    return yield hash(allPromises);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'data-availability': DataAvailabilityService;
  }
}
