/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Bard dimensions service that fetches dimension values
 */

import { hashSettled, resolve } from 'rsvp';
import { A } from '@ember/array';
import Service, { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import { set, getWithDefault, get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import BardDimensionArray from 'navi-data/models/bard-dimension-array';
import SearchUtils from 'navi-data/utils/search';
import config from 'ember-get-config';
import { intersection } from 'lodash-es';
import { getDefaultDataSourceName } from '../utils/adapter';

const LOAD_CARDINALITY = config.navi.searchThresholds.contains;

const MAX_LOAD_CARDINALITY = config.navi.searchThresholds.in;

const SEARCH_OPERATOR_PRIORITY = ['contains', 'in'];

const MAX_SEARCH_RESULT_COUNT = 500;

const MODEL_FACTORY_CACHE = {};

export default class BardDimensionService extends Service {
  /**
   * @private
   * @property {Object} _loadedAllDimensions - the loaded status per dimension
   */
  _loadedAllDimensions = {};

  /**
   * @property {String} identifierField - field name of the id field
   */
  identifierField = 'id';

  /**
   * @private
   * @property {Object} _kegAdapter - the keg adapter object
   */
  _kegAdapter = undefined;

  /**
   * @private
   * @property {Object} _bardAdapter - the bard adapter object
   */
  _bardAdapter = undefined;

  /**
   * @private
   * @property {Object} _serializer - the serializer object
   */
  _serializer = undefined;

  /**
   * @private
   * @property {String} _dimensionKeyPrefix - the prefix for dimension keys stored in Keg
   */
  _dimensionKeyPrefix = 'dimension/';

  /**
   * @property metadataService
   */
  @service('bard-metadata') metadataService;

  /**
   * @method init
   */
  constructor() {
    super(...arguments);

    let owner = getOwner(this);

    //Instantiating the dimension adapter & serializer
    let bardAdapter = owner.lookup('adapter:dimensions/bard');

    set(this, '_bardAdapter', bardAdapter);
    set(this, '_kegAdapter', owner.lookup('adapter:dimensions/keg'));
    set(this, '_serializer', owner.lookup('serializer:dimensions/bard'));
  }

  /**
   * @method getLoadedStatus - Get loaded status for a dimension
   * @param {String} dimension - dimension name
   * @returns {Boolean} - A boolean indicating loaded status for a dimension
   */
  getLoadedStatus(dimension) {
    return !!this._loadedAllDimensions[dimension];
  }

  /**
   * @method _setLoadedStatus - Set loaded status for a dimension
   * @param {String} dimension - dimension name
   */
  _setLoadedStatus(dimension) {
    return (this._loadedAllDimensions[dimension] = true);
  }

  /**
   * @method all - Returns all the dimension values for a bard dimension
   * @param {String} dimension - dimension name
   * @param {Object} [options] - options object
   * @returns {Promise} - Promise with the bard dimension model object
   */
  all(dimension, options = {}) {
    const { _kegAdapter: kegAdapter, _bardAdapter: bardAdapter, _serializer: serializer } = this;

    // fetch all from keg if all records are loaded in keg
    if (this.getLoadedStatus(dimension)) {
      return kegAdapter.all(dimension, options).then(recordsFromKeg => {
        return this._createBardDimensionsArray(recordsFromKeg, recordsFromKeg.rows, dimension);
      });
    }

    return bardAdapter.all(dimension, options).then(recordsFromBard => {
      let serialized = serializer.normalize(dimension, recordsFromBard),
        dimensions = kegAdapter.pushMany(dimension, serialized, options);

      // Fili provides pagination metadata only when data is partially fetched
      let isPartiallyLoaded = get(recordsFromBard, 'meta.pagination');
      if (!isPartiallyLoaded) {
        this._setLoadedStatus(dimension);
      }

      return this._createBardDimensionsArray(recordsFromBard, dimensions, dimension);
    });
  }

  /**
   * Returns dimension values for a bard dimension.
   * A query can be specified to filter dimension values by a specific field.
   * Ex:
   *   Values with id 1, 2, or 3
   *   query = {
   *      field: 'id',
   *      operator: 'in',
   *      values: ['1,2,3']
   *  }
   *
   *   Values with description containing 'mail' and 'english'
   *   query = {
   *      field: 'desc',
   *      operator: 'contains',
   *      values: ['mail', 'english']
   *  }
   *
   * @method find
   * @param {String} dimension - dimension name
   * @param {Array<Query>} andQueries - list of filters to be ANDed together
   * @param {Query} query - filter query object to filter dimension values
   * @param {String} query.field - field used to query
   * @param {String} query.operator - type of query, ex: 'contains' or 'in'
   * @param {Array<String|number>} query.values - list of values representing an OR on a single filter
   * @param {Object} [options] - options object
   * @param {String} [options.clientId]
   * @param {Number} [options.timeout]
   * @param {Number} [options.page]
   * @param {Number} [options.perPage]
   * @returns {BardDimensionArray} - array of bard dimension model objects
   */
  find(dimension, andQueries, options) {
    const { _kegAdapter: kegAdapter, _bardAdapter: bardAdapter, _serializer: serializer } = this;

    // fetch from keg if all records are loaded in keg
    if (this.getLoadedStatus(dimension)) {
      return kegAdapter.find(dimension, andQueries, options).then(recordsFromKeg => {
        return this._createBardDimensionsArray(recordsFromKeg, recordsFromKeg.rows, dimension);
      });
    }

    return bardAdapter.find(dimension, andQueries, options).then(recordsFromBard => {
      let serialized = serializer.normalize(dimension, recordsFromBard),
        dimensions = kegAdapter.pushMany(dimension, serialized, options);
      return this._createBardDimensionsArray(recordsFromBard, dimensions, dimension);
    });
  }

  /**
   * @method getById - Returns the dimension value object for a bard dimension where identifierField value matches value
   * @param {String} dimension - dimension name
   * @param {Object} value - the value to be looked up
   * @param {String} namespace - namespace to the keg
   * @returns {Object} - The bard dimension model object
   */
  getById(dimension, value, namespace=getDefaultDataSourceName()) {
    return this._kegAdapter.getById(dimension, value, namespace);
  }

  /**
   * @method findById - Returns the dimension value object for a bard dimension where identifierField value matches value
   * @param {String} dimension - dimension name
   * @param {Object} value - the value to be looked up
   * @param {Object} [options] - options object
   * @returns {Promise} - Promise with the bard dimension model object
   */
  findById(dimension, value, options = {}) {
    const { _kegAdapter: kegAdapter, _bardAdapter: bardAdapter, _serializer: serializer  } = this;
    const namespace = options.dataSourceName || getDefaultDataSourceName();

    return kegAdapter.findById(dimension, value, namespace).then(recordFromKeg => {
      if (!isEmpty(recordFromKeg)) {
        return recordFromKeg;
      } else {
        return bardAdapter.findById(dimension, value, options).then(recordFromBard => {
          let serialized = serializer.normalize(dimension, recordFromBard);
          return kegAdapter.pushMany(dimension, serialized, options).get('firstObject');
        });
      }
    });
  }

  /**
   * @method _createBardDimensionsArray - Returns a bard dimension array model
   * @param {Object} rawPayload - a raw payload object
   * @param {Object} serializedRecords - array of records serialized as a bard-dimension model
   * @param {String} dimension - dimension name
   * @returns {Object} - A bard-dimension-array model object
   */
  _createBardDimensionsArray(rawPayload, serializedRecords, dimension) {
    if (!isEmpty(rawPayload)) {
      return BardDimensionArray.create({
        dimension,
        content: A(serializedRecords),
        meta: get(rawPayload, 'meta'),
        _dimensionsService: this
      });
    }
  }

  /**
   * Gets search filter operator given a dimension model name
   *
   * @private
   * @function _getSearchOperator
   * @param {String} dimension - dimension model name
   * @returns {String} - search operator
   */
  _getSearchOperator(dimension) {
    assert('dimension must be defined', dimension);

    let searchOperator = A(intersection(SEARCH_OPERATOR_PRIORITY, this._bardAdapter.supportedFilterOperators)).objectAt(
      0
    );

    assert(
      `valid search operator not found for dimensions/${dimension}, supported operators: ${SEARCH_OPERATOR_PRIORITY}`,
      searchOperator
    );

    return searchOperator;
  }

  /**
   * Gets all dimension records containing the search string in the given field
   *
   * @method searchValueField
   * @param {String} dimension - name of dimension
   * @param {String} field - dimension record/value field
   * @param {String} query - search query
   * @param {Object} options - adapter options
   * @returns {Promise} - Array Promise containing the search result
   */
  searchValueField(dimension, field, query, options = {}) {
    assert('search query must be defined', query);
    assert('dimension must be defined', dimension);
    const { metadataService, _bardAdapter: bardAdapter } = this;

    let source = options.dataSourceName || getDefaultDataSourceName(),
      operator = this._getSearchOperator(dimension);

    if (get(metadataService.getById('dimension', dimension, source), 'cardinality') > MAX_LOAD_CARDINALITY) {
      operator = 'in';
    }

    const andValues = operator === 'contains' ? query.split(/,\s+|\s+/).map(s => s.trim()) : [query];
    const andFilters = andValues.map(v => ({
      field,
      operator,
      values: [v]
    }));
    return bardAdapter.find(dimension, andFilters, options);
  }

  /**
   * Gets all dimension records containing the search string
   *
   * @method searchValue
   * @param {String} dimension - name of dimension
   * @param {String} query - search query
   * @param {Object} options - adapter options
   * @returns {Promise} - Array Promise containing the search result
   */
  searchValue(dimension, query, options = {}) {
    let values = query.split(/,\s+|\s+/).map(v => v.trim());

    return this._bardAdapter.search(dimension, { values }, options);
  }

  /**
   * Searches dimension records for search term in options and returns filtered results sorted by relevance
   *
   * @method search
   * @param {String} dimension - dimension name
   * @param {Object} options - search options in the form:
   *              {
   *                  term: <search term>,
   *                  page: <page number>,
   *                  limit: <number of records per page>
   *              }
   *              pagination is optional but if specified both page and limit must be defined
   * @returns {Promise} - Array Promise containing the search result
   */
  search(dimension, options) {
    assert('dimension must be defined', dimension);
    assert('search query must be defined', options.term);

    if (options.page || options.limit) {
      assert('for pagination both page and limit must be defined in search options', options.page && options.limit);
    }

    let source = options.dataSourceName || getDefaultDataSourceName(),
      query = options.term.trim(),
      promise,
      dimensionRecords;

    const { cardinality } = this.metadataService.getById('dimension', dimension, source);
    if (cardinality <= LOAD_CARDINALITY) {
      promise = this.all(dimension, options).then(dimValues => {
        dimensionRecords = A(dimValues);

        return A(
          SearchUtils.searchDimensionRecords(
            dimensionRecords,
            query,
            options.limit || MAX_SEARCH_RESULT_COUNT,
            options.page
          )
        ).mapBy('record');
      });
    } else if (options.useNewSearchAPI) {
      promise = this.searchValue(dimension, query, options).then(dimValues => {
        dimensionRecords = A(getWithDefault(dimValues, 'rows', []));

        return A(SearchUtils.searchDimensionRecords(dimensionRecords, query, MAX_SEARCH_RESULT_COUNT)).mapBy('record');
      });
    } else {
      let promises = {
        searchById: this.searchValueField(dimension, 'id', query, options),
        searchByDescription: this.searchValueField(dimension, 'description', query, options)
      };

      promise = hashSettled(promises).then(({ searchById, searchByDescription }) => {
        dimensionRecords = A()
          .addObjects(getWithDefault(searchById, 'value.rows', []))
          .addObjects(getWithDefault(searchByDescription, 'value.rows', []));

        return A(SearchUtils.searchDimensionRecords(dimensionRecords, query, MAX_SEARCH_RESULT_COUNT)).mapBy('record');
      });
    }

    return new resolve(promise);
  }

  /**
   * @method getFactoryFor - fetches a dimension model for a dimension type
   * @param dimensionName {String} - name of the dimension
   * @param namespace {String} - namespace of dimension
   * @returns {Object} dimension model factory
   */
  getFactoryFor(dimensionName, namespace=getDefaultDataSourceName()) {
    const key = `${namespace}.${dimensionName}`;
    if (MODEL_FACTORY_CACHE[key]) {
      return MODEL_FACTORY_CACHE[key];
    }
    return (MODEL_FACTORY_CACHE[key] = this._createDimensionModelFactory(dimensionName, namespace));
  }

  /**
   * @method _createDimensionModelFactory - creates a dimension model for a dimension type
   * @param dimensionName {String} - name of the dimension
   * @returns {Object} dimension model factory
   */
  _createDimensionModelFactory(dimensionName, namespace=getDefaultDataSourceName()) {
    const metadata = this.metadataService.getById('dimension', dimensionName, namespace),
      dimensionModel = getOwner(this).factoryFor('model:bard-dimension').class,
      identifierField = metadata.get('primaryKeyFieldName');

    return dimensionModel.extend().reopenClass({ identifierField, dimensionName, metadata });
  }
}
