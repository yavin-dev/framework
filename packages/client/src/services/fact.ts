/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviFactsModel from '../models/navi-facts.js';
import NaviFactResponse from '../models/navi-fact-response.js';
import NativeWithCreate, { Config, getInjector, Logger } from '../models/native-with-create.js';
import { ensureHalt } from '../utils/task.js';
import { label, Operation, run, spawn } from 'effection';
import invariant from 'tiny-invariant';
import type NaviFactAdapter from '../adapters/facts/interface.js';
import type { RequestOptions } from '../adapters/facts/interface.js';
import type { RequestV2 } from '../request.js';
import type NaviFactSerializer from '../serializers/facts/interface.js';
import type FactServiceInterface from '../services/interfaces/fact.js';
import type { DataSourcePluginConfig } from '../config/datasource-plugins.js';
import type { Debugger } from 'debug';
import { nanoid } from 'nanoid';

export default class FactsService extends NativeWithCreate implements FactServiceInterface {
  @Config('plugin')
  declare pluginConfig: DataSourcePluginConfig;

  @Logger('facts')
  private declare LOG: Debugger;

  /**
   * @param dataSourceName
   * @returns adapter instance for dataSource
   */
  protected adapterFor(dataSourceName: string): NaviFactAdapter {
    return this.pluginConfig.adapterFor(dataSourceName, 'facts');
  }

  /**
   * @param dataSourceName
   * @returns serializer instance for dataSource
   */
  protected serializerFor(dataSourceName: string): NaviFactSerializer {
    return this.pluginConfig.serializerFor(dataSourceName, 'facts');
  }

  /**
   * Uses the adapter to get the query url for the request
   * @param request - request object
   * @param options - options object
   * @returns url for the request
   */
  getURL(request: RequestV2, options: RequestOptions = {}) {
    const adapter = this.adapterFor(request.dataSource);
    let query;
    try {
      query = adapter.urlForFindQuery(request, options);
    } catch (e) {
      // nothing to do
    }
    return query;
  }

  getDownloadURL(request: RequestV2, options: RequestOptions): Promise<string> {
    return run(this.getDownloadURLTask(request, options), { labels: { name: 'services:facts:getDownloadURL' } });
  }

  fetch(request: RequestV2, options: RequestOptions = {}): Promise<NaviFactsModel> {
    return run(this.fetchTask(request, options), { labels: { name: 'services:facts:fetch' } });
  }

  fetchNext(response: NaviFactResponse, request: RequestV2): Promise<NaviFactsModel | null> {
    return run(this.fetchNextTask(response, request), { labels: { name: 'fservices:facts:etchNext' } });
  }

  fetchPrevious(response: NaviFactResponse, request: RequestV2): Promise<NaviFactsModel | null> {
    return run(this.fetchPreviousTask(response, request), { labels: { name: 'services:facts:fetchPrevious' } });
  }

  /**
   * Uses the adapter to get the download query url for the request
   * @param request - request object
   * @param options - options object
   * @returns - url for the request
   */
  *getDownloadURLTask(request: RequestV2, options: RequestOptions): Operation<string> {
    const adapter = this.adapterFor(request.dataSource);
    const getUrl = adapter.urlForDownloadQuery(request, options);
    yield ensureHalt(getUrl);
    const url = yield getUrl;
    this.LOG('download url generated', { request, url });
    return url;
  }

  /**
   * Returns the response model for the request
   * @param request - request object
   * @param options - options object
   * @returns - Promise with the bard response model object
   */
  *fetchTask(request: RequestV2, options: RequestOptions = {}): Operation<NaviFactsModel> {
    const adapter = this.adapterFor(request.dataSource);
    const serializer = this.serializerFor(request.dataSource);

    const requestId = nanoid(8);
    yield label({ requestId });
    try {
      this.LOG(`fetching request ${requestId} %o`, request);
      const fetchData: unknown = adapter.fetchDataForRequest(request, options);
      yield ensureHalt(fetchData);
      const payload: unknown = yield fetchData;
      const response = serializer.normalize(payload, request, options);
      invariant(response, 'The response is defined');
      this.LOG(`successfully finished fetching ${requestId}`);
      return new NaviFactsModel(getInjector(this), { request, response });
    } catch (e) {
      this.LOG(`error while fetching request ${requestId}`, e);
      const errorModel: Error = serializer.extractError(e, request, options);
      throw errorModel;
    }
  }

  /**
   * @param response
   * @param request
   * @return returns the promise with the next set of results or null
   */
  *fetchNextTask(response: NaviFactResponse, request: RequestV2): Operation<NaviFactsModel | null> {
    if (response.meta.pagination) {
      const { rowsPerPage, numberOfResults, currentPage } = response.meta.pagination;
      const totalPages = numberOfResults / rowsPerPage;

      if (currentPage < totalPages) {
        const fetchNext = yield spawn(
          this.fetchTask(request, {
            page: currentPage + 1,
            perPage: rowsPerPage,
          })
        );
        return yield fetchNext;
      }
    }
    return null;
  }

  /**
   * @param response
   * @param request
   * @return returns the promise with the previous set of results or null
   */
  *fetchPreviousTask(response: NaviFactResponse, request: RequestV2): Operation<NaviFactsModel | null> {
    if (response.meta.pagination) {
      const { rowsPerPage, currentPage } = response.meta.pagination;
      if (currentPage > 1) {
        const fetchPrevious = yield spawn(
          this.fetchTask(request, {
            page: currentPage - 1,
            perPage: rowsPerPage,
          })
        );
        return yield fetchPrevious;
      }
    }
    return null;
  }
}
