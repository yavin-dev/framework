/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviMetadataSerializer, {
  EverythingMetadataPayload,
  MetadataModelMap,
} from '../serializers/metadata/interface.js';
import NativeWithCreate, { Config } from '../models/native-with-create.js';
import Keg from '../utils/classes/keg.js';
import type MetadataModelRegistry from '../models/metadata/registry.js';
import type NaviMetadataAdapter from '../adapters/metadata/interface.js';
import type { ClientConfig, DataSourceConfig } from '../config/datasources.js';
import type { RequestOptions } from '../adapters/facts/interface.js';
import type MetadataServiceInterface from '../services/interfaces/metadata.js';
import type { DataSourcePluginConfig } from '../config/datasource-plugins.js';
import invariant from 'tiny-invariant';

export type MetadataModelTypes = keyof MetadataModelRegistry;

export default class MetadataService extends NativeWithCreate implements MetadataServiceInterface {
  @Config('plugin')
  declare pluginConfig: DataSourcePluginConfig;

  @Config('client')
  declare clientConfig: ClientConfig;

  /**
   * TODO: define keg registry types to remove casting in this class
   */
  private keg = new Keg();

  /**
   * @property {Array} loadedDataSources - list of data sources in which meta data has already been loaded
   */
  loadedDataSources: Set<string> = new Set();

  private loadMetadataPromises: Record<string, Promise<void>> = {};

  /**
   * @param dataSourceName
   * @returns  adapter instance for dataSource
   */
  private adapterFor(dataSourceName: string): NaviMetadataAdapter {
    return this.pluginConfig.adapterFor(dataSourceName, 'metadata');
  }

  /**
   * @param dataSourceName
   * @returns serializer instance for dataSource
   */
  private serializerFor(dataSourceName: string): NaviMetadataSerializer {
    return this.pluginConfig.serializerFor(dataSourceName, 'metadata');
  }

  private dataSourceFor(dataSourceName?: string): DataSourceConfig {
    const { clientConfig } = this;
    return dataSourceName ? clientConfig.getDataSource(dataSourceName) : clientConfig.getDefaultDataSource();
  }

  /**
   * @param payload
   * @param dataSourceName
   */
  private loadEverythingMetadataIntoKeg(payload: EverythingMetadataPayload, dataSourceName: string) {
    this.loadMetadataForType('table', payload.tables, dataSourceName);
    this.loadMetadataForType('metric', payload.metrics, dataSourceName);
    this.loadMetadataForType('dimension', payload.dimensions, dataSourceName);
    this.loadMetadataForType('timeDimension', payload.timeDimensions, dataSourceName);
    this.loadMetadataForType('columnFunction', payload.columnFunctions || [], dataSourceName);
    this.loadMetadataForType('requestConstraint', payload.requestConstraints, dataSourceName);
    this.loadedDataSources.add(dataSourceName);
  }

  /**
   * Loads metadata based on type
   * @param type - type of metadata, table, dimension, or metric
   * @param metadataObjects - array of metadata objects
   */
  private loadMetadataForType<K extends keyof MetadataModelRegistry>(
    type: K,
    metadataObjects: MetadataModelMap[K],
    dataSourceName: string
  ): Array<MetadataModelRegistry[K]> {
    return this.keg.insertMany(`metadata/${type}`, metadataObjects, {
      namespace: dataSourceName,
    }) as Array<MetadataModelRegistry[K]>;
  }

  private async loadAndProcessMetadata(dataSourceName: string, options: RequestOptions): Promise<void> {
    const payload = await this.adapterFor(dataSourceName).fetchEverything(options);
    const normalized = this.serializerFor(dataSourceName).normalize('everything', payload, dataSourceName);
    if (normalized) {
      this.loadEverythingMetadataIntoKeg(normalized, dataSourceName);
    }
  }

  loadMetadata(options: RequestOptions = {}): Promise<void> {
    const { name: dataSourceName } = this.dataSourceFor(options.dataSourceName);
    const existingPromise = this.loadMetadataPromises[dataSourceName];

    if (existingPromise) {
      return existingPromise;
    }

    const newPromise = this.loadAndProcessMetadata(dataSourceName, options);

    //cache promise so we don't execute multiple load fetches
    this.loadMetadataPromises[dataSourceName] = newPromise;

    //if load fails remove from cache so we can retry
    newPromise.catch(() => delete this.loadMetadataPromises[dataSourceName]);

    return newPromise;
  }

  /**
   * Provides an array of all loaded models for a given type
   * @param type - model type
   * @param dataSourceName - optional name of data source
   */
  all<K extends keyof MetadataModelRegistry>(type: K, dataSourceName?: string): Array<MetadataModelRegistry[K]> {
    invariant(
      !dataSourceName || this.loadedDataSources.has(dataSourceName),
      `Metadata must have the requested data source loaded: ${dataSourceName}`
    );
    return this.keg.all(`metadata/${type}`, dataSourceName) as Array<MetadataModelRegistry[K]>;
  }

  /**
   * Provides a single loaded model instance given an identifier
   * @param type - model type
   * @param id - identifier value of model
   * @param dataSourceName - name of data source
   */
  getById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): MetadataModelRegistry[K] | undefined {
    invariant(dataSourceName, '`dataSourceName` argument required');
    return this.keg.getById(`metadata/${type}`, id, dataSourceName) as MetadataModelRegistry[K];
  }

  /**
   * Fetches from data source a single model instance given an identifier
   * @param type - model type
   * @param id - identifier value of model
   * @param dataSourceName - name of data source
   */
  async fetchById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
    invariant(dataSourceName, '`dataSourceName` argument required');
    const rawPayload = await this.adapterFor(dataSourceName).fetchById(type, id, { dataSourceName });
    const normalized = rawPayload
      ? this.serializerFor(dataSourceName).normalize(type, rawPayload, dataSourceName)
      : undefined;

    if (normalized) {
      const model = this.loadMetadataForType(type, normalized, dataSourceName);
      return model[0];
    }
    return undefined;
  }

  /**
   * Provides a single loaded model instance or fetches one, given an identifier
   * @param type - model type
   * @param id - identifier value of model
   * @param dataSourceName - name of data source
   */
  findById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
    invariant(dataSourceName, '`dataSourceName` argument required');
    const kegRecord = this.keg.getById(`metadata/${type}`, id, dataSourceName);
    if (kegRecord && !kegRecord.partialData) {
      return Promise.resolve(this.getById(type, id, dataSourceName)) as Promise<MetadataModelRegistry[K]>;
    }
    return this.fetchById(type, id, dataSourceName);
  }
}
