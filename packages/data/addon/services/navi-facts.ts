/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi facts service that executes and delivers the results
 */
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { getDataSource, getDefaultDataSource } from 'navi-data/utils/adapter';
import NaviFactsModel from 'navi-data/models/navi-facts';
//@ts-ignore
import RequestBuilder from 'navi-data/builder/request';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type { TaskGenerator } from 'ember-concurrency';
import type NaviFactAdapter from 'navi-data/adapters/facts/interface';
import type { RequestOptions, RequestV2 } from 'navi-data/adapters/facts/interface';
import type NaviFactSerializer from 'navi-data/serializers/facts/interface';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';

export default class NaviFactsService extends Service {
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
   * Creates a new request builder instance
   *
   * @param baseRequest - existing request to start from
   * @returns request builder interface
   */
  request(baseRequest: RequestV2) {
    // TODO: Fix here
    return RequestBuilder.create(baseRequest);
  }

  /**
   * Uses the adapter to get the bard query url for the request
   * @param request - request object
   * @param options - options object
   * @returns url for the request
   */
  getURL(request: RequestV2, options: RequestOptions = {}) {
    const { type: dataSourceType } = getDataSource(request.dataSource);
    const adapter = this._adapterFor(dataSourceType);
    let query;
    try {
      query = adapter.urlForFindQuery(request, options);
    } catch (e) {
      // nothing to do
    }
    return query;
  }

  /**
   * Uses the adapter to get the download query url for the request
   * @param request - request object
   * @param options - options object
   * @returns - url for the request
   */
  @task *getDownloadURL(request: RequestV2, options: RequestOptions): TaskGenerator<string> {
    const { type: dataSourceType } = getDataSource(request.dataSource);
    const adapter = this._adapterFor(dataSourceType);
    return yield taskFor(adapter.urlForDownloadQuery).perform(request, options);
  }

  /**
   * Returns the response model for the request
   * @param request - request object
   * @param options - options object
   * @returns - Promise with the bard response model object
   */
  @task *fetch(request: RequestV2, options: RequestOptions = {}): TaskGenerator<NaviFactsModel> {
    const dataSourceName = options?.dataSourceName;
    const type = dataSourceName ? getDataSource(dataSourceName).type : getDefaultDataSource().type;
    const adapter = this._adapterFor(type);
    const serializer = this._serializerFor(type);

    try {
      const payload: unknown = yield taskFor(adapter.fetchDataForRequest).perform(request, options);
      const response = serializer.normalize(payload, request, options);
      assert('The response is defined', response);
      return NaviFactsModel.create({ request, response, _factService: this });
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
  @task *fetchNext(response: NaviFactResponse, request: RequestV2): TaskGenerator<NaviFactsModel | null> {
    if (response.meta.pagination) {
      const { rowsPerPage, numberOfResults, currentPage } = response.meta.pagination;
      const totalPages = numberOfResults / rowsPerPage;

      if (currentPage < totalPages) {
        return yield taskFor(this.fetch).perform(request, {
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
  @task *fetchPrevious(response: NaviFactResponse, request: RequestV2): TaskGenerator<NaviFactsModel | null> {
    if (response.meta.pagination) {
      const { rowsPerPage, currentPage } = response.meta.pagination;
      if (currentPage > 1) {
        return yield taskFor(this.fetch).perform(request, {
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
