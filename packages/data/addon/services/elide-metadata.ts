/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that helps retrieve metadata from Elide WS through GraphQL
 */
import Service, { inject as service } from '@ember/service';
import { MetadataRequestOptions, MetadataQueryType } from '../adapters/elide-metadata';
import { TableMetadataPayload, TableMetadata } from '../models/metadata/table';
import { MetricMetadataPayload } from '../models/metadata/metric';
import { DimensionMetadataPayload } from '../models/metadata/dimension';
import { TimeDimensionMetadataPayload } from '../models/metadata/time-dimension';
import { getDefaultDataSourceName } from '../utils/adapter';
import { dasherize } from '@ember/string';
import { singularize } from 'ember-inflector';
import { assign } from '@ember/polyfills';
import { assert } from '@ember/debug';
import GQLQueries from 'navi-data/gql/metadata-queries';
import Serializer, { NormalizedMetadata, TablePayload } from '../serializers/elide-metadata';
import Adapter from '../adapters/elide-metadata';

import { setOwner, getOwner } from '@ember/application';

const VALID_TYPES = <const>['table', 'metric', 'dimension', 'time-dimension'];

type MetadataType = typeof VALID_TYPES[number];
type MetadataPayload =
  | TableMetadataPayload
  | MetricMetadataPayload
  | DimensionMetadataPayload
  | TimeDimensionMetadataPayload;

export default class ElideMetadata extends Service {
  /**
   * @private
   * @property {Object} adapter - the adapter object
   */
  _adapter?: Adapter = undefined;

  /**
   * @private
   * @property {Object} serializer - the serializer object
   */
  _serializer?: Serializer = undefined;

  /**
   * @private
   * @property {Ember.Service} _keg - keg service
   */
  @service('keg') _keg: TODO;

  /**
   * @property {Array} loadedDataSources - list of data sources in which meta data has already been loaded
   */
  loadedDataSources: string[] = [];

  /**
   * @method init
   */
  constructor() {
    super(...arguments);

    //Instantiating the elide metadata adapter & serializer
    const owner = getOwner(this);
    this._adapter = owner.lookup('adapter:elide-metadata');
    this._serializer = owner.lookup('serializer:elide-metadata');
  }

  /**
   * @method loadMetadata
   * Fetches metadata from the bard WS using the metadata adapter and loads into keg
   *
   * @param {Object} options - options object used by the adapter
   * @returns {Promise} promise that loads metadata
   */
  async loadMetadata(options: MetadataRequestOptions = {}) {
    const dataSource = options.dataSourceName || getDefaultDataSourceName();
    //fetch metadata from WS if metadata not yet loaded
    if (!this.loadedDataSources.includes(dataSource)) {
      const payload = await this._fetchMetadata(options);

      //normalize payload
      payload.source = dataSource;
      const metadata = this._serializer?.normalize(payload);
      this._loadMetadataIntoKeg(metadata, dataSource);
    }
  }

  /**
   * This method can be easily overridden to configure what metadata is loaded
   * @private
   * @method _fetchMetadata
   * @param {Object} options
   * @param {String} options.dataSourceName
   * @returns {Promise<Object>} Payload for a given datasource or the default datasource
   */
  _fetchMetadata(options: MetadataRequestOptions = {}) {
    return this._adapter?.fetchAll('table', options);
  }

  /**
   * @method _loadMetadataForType
   * @private
   * Loads metadata based on type
   *
   * @param {String} type - type of metadata, table, dimension, or metric
   * @param {Array} metadataObjects - array of metadata objects
   */
  _loadMetadataForType(type: MetadataType, metadataObjects: MetadataPayload[], namespace: string) {
    const owner = getOwner(this);
    const metadata = metadataObjects.map(data => {
      const payload = assign({}, data);

      setOwner(payload, owner);
      return payload;
    });

    return this._keg.pushMany(`metadata/${dasherize(type)}`, metadata, { namespace });
  }

  /**
   * Loads normalized metadata POJO into the Keg
   * @private
   * @method _loadMetadataIntoKeg
   * @param {Object} metadata - normalized metadata
   * @param {String} dataSource
   */
  _loadMetadataIntoKeg(metadata: NormalizedMetadata | TablePayload | undefined, dataSource: string) {
    if (!(this.isDestroyed || this.isDestroying) && this.isMetadataNormalized(metadata)) {
      //create metadata model objects and load into keg
      this._loadMetadataForType('table', metadata.tables, dataSource);
      this._loadMetadataForType('dimension', metadata.dimensions, dataSource);
      this._loadMetadataForType('time-dimension', metadata.timeDimensions, dataSource);
      this._loadMetadataForType('metric', metadata.metrics, dataSource);

      this.loadedDataSources.push(dataSource);
    }
  }

  /**
   * @method all
   * returns all metadata objects of type `type`
   *
   * @param {String} type
   * @param {String} namespace - optional, filters the result by namespace
   * @returns {Promise} - array of all table metadata
   */
  all(type: MetadataType, namespace?: string) {
    assert('Type must be a valid navi-data model type', this.isValidType(type));
    assert('Metadata must be loaded before the operation can be performed', this.loadedDataSources.length > 0);

    if (namespace) {
      assert('Metadata must have the requested namespace loaded', this.loadedDataSources.includes(namespace));
    }

    return this._keg.all(`metadata/${type}`, namespace);
  }

  /**
   * @method getById
   * Retrieves metadata based on type and id
   *
   * @param {String} type
   * @param {String} id
   * @param {String} namespace - optional
   * @returns {Object} metadata model object
   */
  getById(type: MetadataType, id: string, namespace?: string) {
    assert('Type must be a valid navi-data model type', this.isValidType(type));
    let source = namespace || getDefaultDataSourceName();
    assert('Metadata must be loaded before the operation can be performed', this.loadedDataSources.includes(source));

    return this._keg.getById(`metadata/${type}`, id, source);
  }

  /**
   * @method fetchById
   * Fetch metadata based on type and id
   *
   * @param type
   * @param id
   * @param namespace
   * @returns fetched record
   */
  fetchById(/*type: MetadataQueryType, id: string, namespace: string*/) {
    //TODO: Implement fetchById
    return undefined;
  }

  /**
   * @method findById
   * gets Metadata or fetches it if necessary
   *
   * @param {String} type
   * @param {String} id
   * @param {String} namespace
   * @returns {Promise}
   */
  findById(type: MetadataType, id: string, namespace?: string) {
    //Get entity if already present in the keg
    let dataSourceName = namespace || getDefaultDataSourceName();

    // TODO: fallback to fetch when fetchById is supported
    return Promise.resolve(this.getById(type, id, dataSourceName));
  }

  /**
   * Convenience method to get a meta data field
   * @param type
   * @param id
   * @param field
   * @param defaultIfNone - (optional) default if meta data or field isn't found
   * @param namespace
   * @returns field if found otherwise defaultIfNone
   */
  getMetaField(
    type: MetadataType,
    id: string,
    field: string,
    defaultIfNone: string | null = null,
    namespace: string | null = null
  ) {
    const dataSourceName = namespace || getDefaultDataSourceName();
    const meta = this.getById(type, id, dataSourceName);
    return meta?.[field] || defaultIfNone;
  }

  /**
   * Convenience method to get namespace of a table
   * @param {String} table
   * @returns {string} - namespace
   */
  getTableNamespace(tableId: string) {
    const items = this._keg.getBy('metadata/table', (recordTable: TableMetadata) => recordTable.id === tableId);

    return items.length ? items[0].source : getDefaultDataSourceName();
  }

  /**
   * Runtime typecheck that typescript can understand
   * @param metadata - Payload
   * @returns true if metadata is of type NormalizedMetadata
   */
  isMetadataNormalized(metadata: NormalizedMetadata | TablePayload | undefined): metadata is NormalizedMetadata {
    return Object.keys(metadata || {}).every(type =>
      VALID_TYPES.includes(singularize(dasherize(type)) as MetadataType)
    );
  }

  /**
   * Runtime typecheck that typescript can understand
   * @param type - type name
   * @returns true if type is MetadataType
   */
  isValidType(type: string): type is MetadataType {
    return VALID_TYPES.includes(type as MetadataType);
  }

  /**
   * Runtime typecheck that typescript can understand
   * @param type - type name
   * @return true if type is included in defined queries
   */
  isQueryableType(type: string): type is MetadataQueryType {
    return Object.keys(GQLQueries).includes(type);
  }
}

declare module '@ember/service' {
  interface Registry {
    'elide-metadata': ElideMetadata;
  }
}
