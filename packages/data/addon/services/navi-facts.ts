/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi facts service that executes and delivers the results
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import NaviFactsModel from '@yavin/client/models/navi-facts';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import { waitFor } from '@ember/test-waiters';
import type { TaskGenerator } from 'ember-concurrency';
import type NaviFactAdapter from '@yavin/client/adapters/facts/interface';
import type { RequestOptions } from '@yavin/client/adapters/facts/interface';
import type { RequestV2 } from '@yavin/client/request';
import type NaviFactSerializer from '@yavin/client/serializers/facts/interface';
import NaviFactResponse from '@yavin/client/models/navi-fact-response';
import type FactService from '@yavin/client/services/interfaces/fact';
import type YavinClientService from 'navi-data/services/yavin-client';

export default class NaviFactsService extends Service implements FactService {
  @service
  declare yavinClient: YavinClientService;

  /**
   * @param type
   * @returns adapter instance for type
   */
  _adapterFor(type = 'bard'): NaviFactAdapter {
    return getOwner(this).lookup(`adapter:facts/${type}`) as NaviFactAdapter;
  }

  /**
   * @param type
   * @returns serializer instance for type
   */
  _serializerFor(type = 'bard'): NaviFactSerializer {
    return getOwner(this).lookup(`serializer:facts/${type}`) as NaviFactSerializer;
  }

  /**
   * Uses the adapter to get the bard query url for the request
   * @param request - request object
   * @param options - options object
   * @returns url for the request
   */
  getURL(request: RequestV2, options: RequestOptions = {}) {
    const { type: dataSourceType } = this.yavinClient.clientConfig.getDataSource(request.dataSource);
    const adapter = this._adapterFor(dataSourceType);
    let query;
    try {
      query = adapter.urlForFindQuery(request, options);
    } catch (e) {
      // nothing to do
    }
    return query;
  }

  getDownloadURL(request: RequestV2, options: RequestOptions) {
    return taskFor(this.getDownloadURLTask).perform(request, options);
  }

  @waitFor
  fetch(request: RequestV2, options: RequestOptions = {}) {
    return taskFor(this.fetchTask).perform(request, options);
  }

  @waitFor
  fetchNext(response: NaviFactResponse, request: RequestV2) {
    return taskFor(this.fetchNextTask).perform(response, request);
  }

  @waitFor
  fetchPrevious(response: NaviFactResponse, request: RequestV2) {
    return taskFor(this.fetchPreviousTask).perform(response, request);
  }

  /**
   * Uses the adapter to get the download query url for the request
   * @param request - request object
   * @param options - options object
   * @returns - url for the request
   */
  @task *getDownloadURLTask(request: RequestV2, options: RequestOptions): TaskGenerator<string> {
    const { type: dataSourceType } = this.yavinClient.clientConfig.getDataSource(request.dataSource);
    const adapter = this._adapterFor(dataSourceType);
    return yield adapter.urlForDownloadQuery(request, options);
  }

  /**
   * Returns the response model for the request
   * @param request - request object
   * @param options - options object
   * @returns - Promise with the bard response model object
   */
  @task *fetchTask(request: RequestV2, options: RequestOptions = {}): TaskGenerator<NaviFactsModel> {
    const { type: dataSourceType } = this.yavinClient.clientConfig.getDataSource(request.dataSource);
    const adapter = this._adapterFor(dataSourceType);
    const serializer = this._serializerFor(dataSourceType);

    try {
      const payload: unknown = yield adapter.fetchDataForRequest(request, options);
      const response = serializer.normalize(payload, request, options);
      assert('The response is defined', response);
      return new NaviFactsModel(getOwner(this).lookup('service:client-injector'), { request, response });
    } catch (e) {
      const errorModel: Error = serializer.extractError(e, request, options);
      throw errorModel;
    }
  }

  /**
   * @param response
   * @param request
   * @return returns the promise with the next set of results or null
   */
  @task *fetchNextTask(response: NaviFactResponse, request: RequestV2): TaskGenerator<NaviFactsModel | null> {
    if (response.meta.pagination) {
      const { rowsPerPage, numberOfResults, currentPage } = response.meta.pagination;
      const totalPages = numberOfResults / rowsPerPage;

      if (currentPage < totalPages) {
        return yield taskFor(this.fetchTask).perform(request, {
          page: currentPage + 1,
          perPage: rowsPerPage,
        });
      }
    }
    return null;
  }

  /**
   * @param response
   * @param request
   * @return returns the promise with the previous set of results or null
   */
  @task *fetchPreviousTask(response: NaviFactResponse, request: RequestV2): TaskGenerator<NaviFactsModel | null> {
    if (response.meta.pagination) {
      const { rowsPerPage, currentPage } = response.meta.pagination;
      if (currentPage > 1) {
        return yield taskFor(this.fetchTask).perform(request, {
          page: currentPage - 1,
          perPage: rowsPerPage,
        });
      }
    }
    return null;
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-facts': NaviFactsService;
  }
}
