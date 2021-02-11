/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Bard facts service that executes and delivers the results
 */

import Service from '@ember/service';
import { getOwner } from '@ember/application';
import NaviFactsModel from 'navi-data/models/navi-facts';
//@ts-ignore
import RequestBuilder from 'navi-data/builder/request';
import NaviFactAdapter, { RequestOptions, RequestV2 } from 'navi-data/adapters/facts/interface';
import NaviFactSerializer, { ResponseV1 } from 'navi-data/serializers/facts/interface';
import { getDataSource, getDefaultDataSource } from 'navi-data/utils/adapter';

export default class NaviFactsService extends Service {
  /**
   * @method _adapterFor
   *
   * @param {String} type
   * @returns {Adapter} adapter instance for type
   */
  _adapterFor(type = 'bard'): NaviFactAdapter {
    return getOwner(this).lookup(`adapter:facts/${type}`) as NaviFactAdapter;
  }

  /**
   * @method _serializerFor
   *
   * @param {String} type
   * @returns {Serializer} serializer instance for type
   */
  _serializerFor(type = 'bard'): NaviFactSerializer {
    return getOwner(this).lookup(`serializer:facts/${type}`) as NaviFactSerializer;
  }

  /**
   * Creates a new request builder instance
   *
   * @method request
   * @param {Object} baseRequest - existing request to start from
   * @returns {Object} request builder interface
   */
  request(baseRequest: RequestV2) {
    // TODO: Fix here
    return RequestBuilder.create(baseRequest);
  }

  /**
   * @method getURL - Uses the adapter to get the bard query url for the request
   * @param {Object} request - request object
   * @param {Object} [options] - options object
   * @returns {String} - url for the request
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
   * @method getURL - Uses the adapter to get the download query url for the request
   * @param {Object} request - request object
   * @param {Object} [options] - options object
   * @returns {String} - url for the request
   */
  getDownloadURL(request: RequestV2, options: RequestOptions) {
    const { type: dataSourceType } = getDataSource(request.dataSource);
    const adapter = this._adapterFor(dataSourceType);
    return adapter.urlForDownloadQuery(request, options);
  }

  /**
   * @method fetch - Returns the bard response model for the request
   * @param {Object} request - request object
   * @param {Object} [options] - options object
   * @param {Number} [options.timeout] - milliseconds to wait before timing out
   * @param {String} [options.clientId] - clientId value to be passed as a request header
   * @param {Object} [options.customHeaders] - hash of header names and values
   * @returns {Promise} - Promise with the bard response model object
   */
  async fetch(request: RequestV2, options: RequestOptions = {}): Promise<NaviFactsModel> {
    const dataSourceName = options?.dataSourceName;
    const type = dataSourceName ? getDataSource(dataSourceName).type : getDefaultDataSource().type;
    const adapter = this._adapterFor(type);
    const serializer = this._serializerFor(type);

    try {
      const payload = await adapter.fetchDataForRequest(request, options);
      const response = serializer.normalize(payload, request);
      return NaviFactsModel.create({ request, response, _factService: this });
    } catch (e) {
      const errorModel: Error = serializer.extractError(e, request);
      throw errorModel;
    }
  }

  /**
   * @method fetchNext
   * @param {Object} response
   * @param {Object} request
   * @return {Promise|null} returns the promise with the next set of results or null
   */
  fetchNext(response: ResponseV1, request: RequestV2): Promise<NaviFactsModel> | null {
    if (response.meta.pagination) {
      const { perPage, numberOfResults, currentPage } = response.meta.pagination;
      const totalPages = numberOfResults / perPage;

      if (currentPage < totalPages) {
        return this.fetch(request, {
          page: currentPage + 1,
          perPage: perPage
        });
      }
    }
    return null;
  }

  /**
   * @method fetchPrevious
   * @param {Object} response
   * @param {Object} request
   * @return {Promise|null} returns the promise with the previous set of results or null
   */
  fetchPrevious(response: ResponseV1, request: RequestV2): Promise<NaviFactsModel> | null {
    if (response.meta.pagination) {
      const { rowsPerPage, currentPage } = response.meta.pagination;
      if (currentPage > 1) {
        return this.fetch(request, {
          page: currentPage - 1,
          perPage: rowsPerPage
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
