/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Bard dimensions service that fetches dimension values
 */

import { A } from '@ember/array';
import Service, { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import { isEmpty } from '@ember/utils';
import BardDimensionArray from 'navi-data/models/bard-dimension-array';
//@ts-ignore
import SearchUtils from 'navi-data/utils/search';
import { intersection } from 'lodash-es';
import { getDefaultDataSourceName } from '../utils/adapter';
import CARDINALITY_SIZES from '../utils/enums/cardinality-sizes';
import NaviMetadataService from './navi-metadata';

const SEARCH_OPERATOR_PRIORITY = ['contains', 'in'];

const MAX_SEARCH_RESULT_COUNT = 500;

const MODEL_FACTORY_CACHE: Record<string, TODO> = {};

export default class BardDimensionService extends Service {
  /**
   * @private
   * @property {Object} _loadedAllDimensions - the loaded status per dimension
   */
  _loadedAllDimensions: Record<string, boolean> = {};

  /**
   * @property {String} identifierField - field name of the id field
   */
  identifierField = 'id';

  /**
   * @private
   * @property {Object} _kegAdapter - the keg adapter object
   */
  _kegAdapter!: TODO;

  /**
   * @private
   * @property {Object} _bardAdapter - the bard adapter object
   */
  _bardAdapter!: TODO;

  /**
   * @private
   * @property {Object} _serializer - the serializer object
   */
  _serializer!: TODO;

  /**
   * @private
   * @property {String} _dimensionKeyPrefix - the prefix for dimension keys stored in Keg
   */
  _dimensionKeyPrefix = 'dimension/';

  @service
  private naviMetadata!: NaviMetadataService;

  /**
   * @method init
   */
  constructor() {
    super(...arguments);
    const owner = getOwner(this);

    //Instantiating the dimension adapter & serializer
    this._bardAdapter = owner.lookup('adapter:dimensions/bard');
    this._kegAdapter = owner.lookup('adapter:dimensions/keg');
    this._serializer = owner.lookup('serializer:dimensions/bard');
  }

  /**
   * @method getLoadedStatus - Get loaded status for a dimension
   * @param {String} dimension - dimension name
   * @returns {Boolean} - A boolean indicating loaded status for a dimension
   */
  getLoadedStatus(dimension: string) {
    return !!this._loadedAllDimensions[dimension];
  }

  /**
   * @method _setLoadedStatus - Set loaded status for a dimension
   * @param {String} dimension - dimension name
   */
  _setLoadedStatus(dimension: string) {
    return (this._loadedAllDimensions[dimension] = true);
  }

  /**
   * @method all - Returns all the dimension values for a bard dimension
   * @param {String} dimension - dimension name
   * @param {Object} [options] - options object
   * @returns {Promise} - Promise with the bard dimension model object
   */
  all(dimension: string, options: TODO = {}) {
    const { _kegAdapter: kegAdapter, _bardAdapter: bardAdapter, _serializer: serializer } = this;

    // fetch all from keg if all records are loaded in keg
    if (this.getLoadedStatus(dimension)) {
      return kegAdapter.all(dimension, options).then((recordsFromKeg: TODO) => {
        return this._createBardDimensionsArray(recordsFromKeg, recordsFromKeg.rows, dimension);
      });
    }

    return bardAdapter.all(dimension, options).then((recordsFromBard: TODO) => {
      const serialized = serializer.normalize(dimension, recordsFromBard);
      const dimensions = kegAdapter.pushMany(dimension, serialized, options);

      // Fili provides pagination metadata only when data is partially fetched
      const isPartiallyLoaded = recordsFromBard.meta?.pagination;
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
  find(dimension: string, andQueries: TODO, options: TODO) {
    const { _kegAdapter: kegAdapter, _bardAdapter: bardAdapter, _serializer: serializer } = this;

    // fetch from keg if all records are loaded in keg
    if (this.getLoadedStatus(dimension)) {
      return kegAdapter.find(dimension, andQueries, options).then((recordsFromKeg: TODO) => {
        return this._createBardDimensionsArray(recordsFromKeg, recordsFromKeg.rows, dimension);
      });
    }

    return bardAdapter.find(dimension, andQueries, options).then((recordsFromBard: TODO) => {
      const serialized = serializer.normalize(dimension, recordsFromBard);
      const dimensions = kegAdapter.pushMany(dimension, serialized, options);
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
  getById(dimension: string, value: string, namespace = getDefaultDataSourceName()) {
    return this._kegAdapter.getById(dimension, value, namespace);
  }

  /**
   * @method findById - Returns the dimension value object for a bard dimension where identifierField value matches value
   * @param {String} dimension - dimension name
   * @param {Object} value - the value to be looked up
   * @param {Object} [options] - options object
   * @returns {Promise} - Promise with the bard dimension model object
   */
  findById(dimension: string, value: string, options: TODO = {}) {
    const { _kegAdapter: kegAdapter, _bardAdapter: bardAdapter, _serializer: serializer } = this;
    const namespace = options.dataSourceName || getDefaultDataSourceName();

    return kegAdapter.findById(dimension, value, namespace).then((recordFromKeg: TODO) => {
      if (!isEmpty(recordFromKeg)) {
        return recordFromKeg;
      } else {
        return bardAdapter.findById(dimension, value, options).then((recordFromBard: TODO) => {
          const serialized = serializer.normalize(dimension, recordFromBard);
          return kegAdapter.pushMany(dimension, serialized, options).firstObject;
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
  _createBardDimensionsArray(rawPayload: TODO, serializedRecords: TODO, dimension: string): object | undefined {
    if (!isEmpty(rawPayload)) {
      return BardDimensionArray.create({
        dimension,
        content: A(serializedRecords),
        meta: rawPayload.meta,
        dimensionsService: this
      });
    }
    return undefined;
  }

  /**
   * Gets search filter operator given a dimension model name
   *
   * @private
   * @function _getSearchOperator
   * @param {String} dimension - dimension model name
   * @returns {String} - search operator
   */
  _getSearchOperator(dimension: string) {
    assert('dimension must be defined', dimension);

    const searchOperator = intersection(SEARCH_OPERATOR_PRIORITY, this._bardAdapter.supportedFilterOperators)[0];

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
  searchValueField(dimension: string, field: string, query: string, options: TODO = {}) {
    assert('search query must be defined', query);
    assert('dimension must be defined', dimension);
    const { naviMetadata, _bardAdapter: bardAdapter } = this;

    const source = options.dataSourceName || getDefaultDataSourceName();
    let operator = this._getSearchOperator(dimension);

    if (naviMetadata.getById('dimension', dimension, source)?.cardinality === CARDINALITY_SIZES[2]) {
      operator = 'in';
    }

    const andValues = operator === 'contains' ? query.split(/,\s+|\s+/).map((s: string) => s.trim()) : [query];
    const andFilters = andValues.map((v: TODO) => ({
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
  searchValue(dimension: string, query: string, options = {}) {
    const values = query.split(/,\s+|\s+/).map((v: string) => v.trim());

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
  async search(dimension: string, options: TODO = {}) {
    assert('dimension must be defined', dimension);
    assert('search query must be defined', options.term);

    if (options.page || options.limit) {
      assert('for pagination both page and limit must be defined in search options', options.page && options.limit);
    }

    const { naviMetadata } = this;
    const source = options.dataSourceName || getDefaultDataSourceName();
    const query = options.term.trim();
    const dimensionLookup = naviMetadata.getById('dimension', dimension, source);
    const cardinality = dimensionLookup?.cardinality;

    if (cardinality === CARDINALITY_SIZES[0]) {
      const dimValues = await this.all(dimension, options);
      const dimensionRecords = A(dimValues);

      return A(
        SearchUtils.searchDimensionRecords(
          dimensionRecords,
          query,
          options.limit || MAX_SEARCH_RESULT_COUNT,
          options.page
        )
      ).mapBy('record');
    } else if (options.useNewSearchAPI) {
      const dimValues = await this.searchValue(dimension, query, options);
      const dimensionRecords = A(dimValues.rows || []);

      return A(SearchUtils.searchDimensionRecords(dimensionRecords, query, MAX_SEARCH_RESULT_COUNT)).mapBy('record');
    } else {
      const searchById = await this.searchValueField(dimension, 'id', query, options).catch(() => ({ rows: [] }));
      const searchByDescription = await this.searchValueField(dimension, 'description', query, options).catch(() => ({
        rows: []
      }));

      const dimensionRecords = A()
        .addObjects(searchById?.rows || [])
        .addObjects(searchByDescription?.rows || []);

      return A(SearchUtils.searchDimensionRecords(dimensionRecords, query, MAX_SEARCH_RESULT_COUNT)).mapBy('record');
    }
  }

  /**
   * @method getFactoryFor - fetches a dimension model for a dimension type
   * @param dimensionName {String} - name of the dimension
   * @param namespace {String} - namespace of dimension
   * @returns {Object} dimension model factory
   */
  getFactoryFor(dimensionName: string, namespace = getDefaultDataSourceName()) {
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
  _createDimensionModelFactory(dimensionName: string, namespace = getDefaultDataSourceName()) {
    const metadata = this.naviMetadata.getById('dimension', dimensionName, namespace),
      dimensionModel = getOwner(this).factoryFor('model:bard-dimension').class,
      identifierField = metadata?.primaryKeyFieldName;

    return dimensionModel.extend().reopenClass({ identifierField, dimensionName, metadata });
  }
}

declare module '@ember/service' {
  interface Registry {
    'bard-dimensions': BardDimensionService;
  }
}
