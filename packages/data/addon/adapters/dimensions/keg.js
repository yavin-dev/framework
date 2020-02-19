/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for Keg.
 */
import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { assert, warn } from '@ember/debug';
import { inject as service } from '@ember/service';
import { assign } from '@ember/polyfills';
import EmberObject, { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { intersection } from 'lodash-es';
import { getDefaultDataSourceName } from '../../utils/adapter';

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
   * @param {String} namespace - namespace from keg
   * @returns {Object} metadata object
   */
  _getDimensionMetadata(dimensionName, namespace) {
    namespace = namespace || getDefaultDataSourceName();
    return get(this, 'bardMetadata').getById('dimension', dimensionName, namespace);
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
  all(dimension, options = {}) {
    let keg = get(this, 'keg'),
      namespace = options.dataSourceName || getDefaultDataSourceName();

    return Promise.resolve(
      this._buildResponse(keg.all(`${KEG_NAMESPACE}/${namespace}.${dimension}`, { namespace }), options)
    );
  },

  /**
   * @method getById - Finds a dimension value object by its id
   * @param {String} dimension - dimension name
   * @param {String} value - the value to be looked up
   * @param {String} namespace - namespace from the keg
   * @returns {Object} - The dimension value object
   */
  getById(dimension, value, namespace) {
    namespace = namespace || getDefaultDataSourceName();
    return get(this, 'keg').getById(`${KEG_NAMESPACE}/${namespace}.${dimension}`, value);
  },

  /**
   * @method findById - Finds a dimension value object by its id
   * @param {String} dimension - dimension name
   * @param {String} value - the value to be looked up
   * @param {String} namespace - namespace from the keg
   * @returns {Promise} - Promise with the response
   */
  findById(dimension, value, namespace) {
    namespace = namespace || getDefaultDataSourceName();
    return Promise.resolve(this.getById(dimension, value, namespace));
  },

  /**
   * @method find - Find dimension values matching the query
   * @param {String} dimension - dimension name
   * @param {Array<Object>} andQueries - the array query objects to be ANDed together
   * @param {Object} [options] - options object
   *      Ex: {
   *        page: 1,
   *        perPage: 200
   *      }
   * @returns {Promise} - Promise with the response
   */
  find(dimension, andQueries, options = {}) {
    const namespace = options.dataSourceName || getDefaultDataSourceName();
    if (!Array.isArray(andQueries)) {
      // if not array
      warn('find() was not passed an array of queries, wrapping as single query array', {
        id: 'keg-find-query-as-array'
      });
      andQueries = [andQueries]; // wrap
    }
    assert("You must pass an 'Array' of queries to be ANDed together", Array.isArray(andQueries));
    // defaults to 'in' operation if operator is not specified
    assert(
      "Only 'in' operation is currently supported in Keg",
      andQueries.filter(q => q.operator).every(q => q.operator === 'in')
    );

    const stringQueries = andQueries.filter(q => typeof q.values === 'string');
    if (stringQueries.length) {
      warn('find() was passed query.values as a string, falling back to splitting by commas', {
        id: 'keg-find-query-values-as-array'
      });
      stringQueries.forEach(query => (query.values = query.values.split(',')));
    }
    assert("Only 'Array' query values are currently supported in Keg", andQueries.every(q => Array.isArray(q.values)));

    let keg = get(this, 'keg');

    let defaultQueryOptions = {
      field: this._getDimensionMetadata(dimension, namespace).get('primaryKeyFieldName'),
      values: []
    };

    andQueries = andQueries.map(query => assign({}, defaultQueryOptions, query));

    //convert navi-data query object interface to keg query object interface
    const query = andQueries.reduce((all, query) => {
      let values;
      if (all.hasOwnProperty(query.field)) {
        // if it already exists, we AND it by intersecting the values
        values = intersection(all[query.field], query.values);
      } else {
        values = query.values;
      }
      all[query.field] = values;

      return all;
    }, {});

    return Promise.resolve(
      this._buildResponse(keg.getBy(`${KEG_NAMESPACE}/${namespace}.${dimension}`, query), options)
    );
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
  pushMany(dimension, payload, options = {}) {
    let namespace = options.dataSourceName || getDefaultDataSourceName(),
      modelFactory = get(this, 'bardDimensions').getFactoryFor(dimension, namespace);

    return get(this, 'keg').pushMany(
      `${KEG_NAMESPACE}/${namespace}.${dimension}`,
      payload,
      assign(
        {
          modelFactory,
          namespace
        },
        options
      )
    );
  }
});
