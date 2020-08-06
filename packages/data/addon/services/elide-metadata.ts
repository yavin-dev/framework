/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that helps retrieve metadata from Elide WS through GraphQL
 */
import Service, { inject as service } from '@ember/service';
import { MetadataQueryType } from '../adapters/metadata/elide';
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
import Serializer, { TablePayload } from '../serializers/metadata/elide';

import { setOwner, getOwner } from '@ember/application';
import NaviMetadataAdapter, { MetadataOptions } from 'navi-data/adapters/metadata/interface';
import { EverythingMetadataPayload } from 'navi-data/serializers/metadata/interface';

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
  readonly _adapter!: NaviMetadataAdapter;

  /**
   * @private
   * @property {Object} serializer - the serializer object
   */
  readonly _serializer!: Serializer;

  /**
   * @private
   * @property {Ember.Service} _keg - keg service
   */
  @service('keg') _keg: TODO;

  /**
   * @property loadedDataSources - list of data sources in which meta data has already been loaded
   */
  loadedDataSources: string[] = [];

  /**
   * @constructor
   */
  constructor() {
    super(...arguments);

    //Instantiating the elide metadata adapter & serializer
    const owner = getOwner(this);
    this._adapter = owner.lookup('adapter:metadata/elide');
    this._serializer = owner.lookup('serializer:metadata/elide');
  }

  /**
   * @method loadMetadata
   * Fetches metadata from the bard WS using the metadata adapter and loads into keg
   *
   * @param options - options object used by the adapter
   * @returns {Promise} promise that loads metadata
   */
  async loadMetadata(options: MetadataOptions = {}) {
    const dataSource = options.dataSourceName || getDefaultDataSourceName();
    //fetch metadata from WS if metadata not yet loaded
    if (!this.loadedDataSources.includes(dataSource)) {
      const payload = await this._adapter.fetchEverything(options);

      //normalize payload
      const metadata = this._serializer.normalize('everything', payload, dataSource);
      this._loadMetadataIntoKeg(metadata, dataSource);
    }
  }

  /**
   * @method _loadMetadataForType
   * @private
   * Loads metadata based on type
   *
   * @param type - type of metadata, table, dimension, time-dimension, or metric
   * @param metadataObjects - array of metadata objects
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
   * @param metadata - normalized metadata
   * @param dataSource
   * @returns void
   */
  _loadMetadataIntoKeg(metadata: EverythingMetadataPayload | TablePayload | undefined, dataSource: string): void {
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
   * @param type
   * @param namespace - optional, filters the result by namespace
   * @returns {Promise<MetadataModel[]>} - array of all table metadata
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
   * @param type
   * @param id
   * @param namespace - optional
   * @returns {MetadataModel} metadata model object
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
    assert('elide-metadata.fetchById must be defined before it can be called', false);
  }

  /**
   * @method findById
   * gets Metadata or fetches it if necessary
   *
   * @param type
   * @param id
   * @param namespace
   * @returns {Promise<MetadataModel>}
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
  isMetadataNormalized(metadata: object | undefined): metadata is EverythingMetadataPayload {
    return Object.keys(metadata || {}).every(type => this.isValidType(singularize(dasherize(type))));
  }

  /**
   * Runtime typecheck that typescript can understand
   * @param type - type name
   * @returns true if type is MetadataType
   */
  isValidType(type: string): type is MetadataType {
    return ((VALID_TYPES as unknown) as string[]).includes(type);
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
