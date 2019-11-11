/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Bard facts service that executes and delivers the results
 */

import Service from '@ember/service';
import { getOwner } from '@ember/application';
import BardFactsModel from 'navi-data/models/bard-facts';
import RequestBuilder from 'navi-data/builder/request';

export default Service.extend({
  /**
   * @private
   * @property {Object} adapter - the adapter object
   */
  _adapter: undefined,

  /**
   * @private
   * @property {Object} serializer - the serializer object
   */
  _serializer: undefined,

  /**
   * @method init
   */
  init() {
    this._super(...arguments);

    //Instantiating the bard response adapter & serializer
    let adapter = getOwner(this).lookup('adapter:bard-facts');

    this.set('_adapter', adapter);
    this.set('_serializer', getOwner(this).lookup('serializer:bard-facts'));
  },

  /**
   * Creates a new request builder instance
   *
   * @method request
   * @param {Object} baseRequest - existing request to start from
   * @returns {Object} request builder interface
   */
  request(baseRequest) {
    return RequestBuilder.create(baseRequest);
  },

  /**
   * @method getURL - Uses the adapter to get the bard query url for the request
   * @param {Object} request - request object
   * @param {Object} [options] - options object
   * @returns {String} - url for the request
   */
  getURL(request, options) {
    let adapter = this.get('_adapter');
    return adapter.urlForFindQuery(request, options);
  },

  /**
   * @method fetch - Returns the bard response model for the request
   * @param {Object} request - request object
   * @param {Object} [options] - options object
   * @param {Number} [options.timeout] - milliseconds to wait before timing out
   * @param {String} [options.clientId] - clientId value to be passed as a request header
   * @param {Object} [options.customHeaders] - hash of header names and values
   * @returns {Promise} - Promise with the bard response model object
   */
  fetch(request, options) {
    let adapter = this.get('_adapter'),
      serializer = this.get('_serializer');
    return adapter.fetchDataForRequest(request, options).then(payload => {
      return BardFactsModel.create({
        request: request,
        response: serializer.normalize(payload),
        _factsService: this
      });
    });
  },

  /**
   * @method fetchNext
   * @param {Object} response 
   * @param {Object} request 
   * @return {Promise|null} returns the promise with the next set of results or null
   */
  fetchNext(response, request) {
    if (response.meta.pagination) {
      const {
        perPage,
        numberOfResults, 
        currentPage
      } = response.meta.pagination;
      
      const totalPages = numberOfResults / perPage;
      
      if (currentPage < totalPages) {
        let options = {
            page: currentPage + 1,
            perPage: perPage
          };

        return this.fetch(request, options);
      }
    }
    return null;
  },

  /**
   * @method fetchPrevious
   * @param {Object} response 
   * @param {Object} request 
   * @return {Promise|null} returns the promise with the previous set of results or null
   */
  fetchPrevious(response, request){
    if (response.meta.pagination) {
      if (response.meta.pagination.currentPage > 1) {
        const options = {
          page: response.meta.pagination.currentPage - 1,
          perPage: response.meta.pagination.rowsPerPage
        };

        return this.fetch(request, options);
      }
    }

    return null;
  }
});
