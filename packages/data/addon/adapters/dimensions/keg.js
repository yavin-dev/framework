/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for Keg.
 */

import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { assign } from '@ember/polyfills';
import EmberObject, { get } from '@ember/object';
import { getOwner } from '@ember/application';

const KEG_NAMESPACE = 'dimension';

export default EmberObject.extend({
  /**
   * @property {Service} keg
   */
  keg: undefined,

  /**
   * @property {Service} bard metadata
   */
  bardMetadata: service(),

  /**
   * @property {Service} bard dimensions
   */
  bardDimensions: service(),

  /**
   * Returns metadata for dimensionName
   *
   * @method _getDimensionMetadata
   * @private
   * @param {String} dimensionName - name of dimension
   * @returns {Object} metadata object
   */
  _getDimensionMetadata(dimensionName) {
    return get(this, 'bardMetadata').getById('dimension', dimensionName);
  },

  /**
   * @method init
   */
  init() {
    this._super(...arguments);

    //Instantiating the Keg service
    this.set('keg', getOwner(this).lookup('service:keg'));
  },

  /**
   * @private
   * @method _buildResponse - Builds a response object which is similar to bard response
   * @param {Array} records - array of records (fetched from Keg)
   * @param {Object} [options] - options object
   * @param {int} [options.page] - page number
   * @param {int} [options.perPage] - number of records per page.
   *      Ex: {
   *        page: 1,
   *        perPage: 200
   *      }
   * @returns {Object} - The response object.
   */
  _buildResponse(records, options = {}) {
    if (records && records.length) {
      if (options.page && options.perPage) {
        /*
         * Computing begining and numberOfRecords to be used in Array.slice() method.
         */
        let begin = options.perPage * options.page - options.perPage,
          numberOfRecords = options.page * options.perPage;

        // Fail if boundary conditions are wrong
        assert(
          `'${begin}' is not a valid pagination value, can be fixed by passing correct values for page & per page`,
          begin >= 0
        );

        assert(
          `'${numberOfRecords}' is not a valid pagination value, can be fixed by passing correct values for page & per page`,
          numberOfRecords <= records.length
        );

        let slicedRecords = records.slice(begin, numberOfRecords),
          newRows = A();

        for (let i = 0; i < slicedRecords.length; i++) {
          newRows.pushObject(slicedRecords[i]);
        }

        // Build response object
        return {
          meta: {
            pagination: {
              rowsPerPage: options.perPage,
              numberOfResults: records.length,
              currentPage: options.page
            }
          },
          rows: newRows
        };
      }
    }

    return {
      rows: records
    };
  },

  /**
   * @method all - Makes a request for all values for a given dimension
   * @param {String} dimension - dimension name
   * @param {Object} [options] - options object
   *      Ex: {
   *        page: 1,
   *        perPage: 200
   *        ...
   *      }
   * @returns {Promise} - Promise with the response
   */
  all(dimension, options) {
    let keg = get(this, 'keg');

    return Promise.resolve(this._buildResponse(keg.all(`${KEG_NAMESPACE}/${dimension}`), options));
  },

  /**
   * @method findById - Finds a dimension value object by its id
   * @param {String} dimension - dimension name
   * @param {String} value - the value to be looked up
   * @returns {Promise} - Promise with the response
   */
  findById(dimension, value) {
    let keg = get(this, 'keg');

    return Promise.resolve(keg.getById(`${KEG_NAMESPACE}/${dimension}`, value));
  },

  /**
   * @method find - Find dimension values matching the query
   * @param {String} dimension - dimension name
   * @param {Object} query - the query object
   * @param {Object} [options] - options object
   *      Ex: {
   *        page: 1,
   *        perPage: 200
   *      }
   * @returns {Promise} - Promise with the response
   */
  find(dimension, query, options) {
    // defaults to 'in' operation if operator is not specified
    assert("Only 'in' operation is currently supported in Keg", query.operator ? query.operator === 'in' : true);

    // TODO: might need to redfine or investigate the find interface, string of comma seperated values or array of values
    assert("Only 'string' query values is currently supported in Keg", typeof query.values === 'string');

    let keg = get(this, 'keg');

    let defaultQueryOptions = {
      field: this._getDimensionMetadata(dimension).get('primaryKeyFieldName'),
      values: []
    };

    query = assign({}, defaultQueryOptions, query);

    query.values = query.values.split(',');

    //convert navi-data query object interface to keg query object interface
    query = { [query.field]: query.values };

    return Promise.resolve(this._buildResponse(keg.getBy(`${KEG_NAMESPACE}/${dimension}`, query), options));
  },

  /**
   * Pushes an array of dimension records into the store
   *
   * @method pushMany
   * @param {String} dimension - type name of the dimension
   * @param {Array} rawRecords - array of dimension objects
   * @param {Object} [options] - keg.pushMany options object
   * @returns {Array} records that were pushed to the keg
   */
  pushMany(dimension, payload, options) {
    let modelFactory = get(this, 'bardDimensions').getFactoryFor(dimension);

    return get(this, 'keg').pushMany(
      `${KEG_NAMESPACE}/${dimension}`,
      payload,
      assign(
        {
          modelFactory
        },
        options
      )
    );
  }
});
