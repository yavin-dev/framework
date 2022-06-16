/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import NaviMetadataSerializer, {
  EverythingMetadataPayload,
  MetadataModelMap,
} from '@yavin/client/serializers/metadata/interface';
import { waitFor } from '@ember/test-waiters';
import Keg from '@yavin/client/utils/classes/keg';
import type MetadataModelRegistry from '@yavin/client/models/metadata/registry';
import type NaviMetadataAdapter from '@yavin/client/adapters/metadata/interface';
import type { DataSourceConfig } from '@yavin/client/config/datasources';
import type { RequestOptions } from '@yavin/client/adapters/facts/interface';
import type MetadataService from '@yavin/client/services/interfaces/metadata';
import type YavinClientService from 'navi-data/services/yavin-client';

export type MetadataModelTypes = keyof MetadataModelRegistry;

export default class NaviMetadataService extends Service implements MetadataService {
  @service
  declare yavinClient: YavinClientService;

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
    return this.yavinClient.pluginConfig.adapterFor(dataSourceName, 'metadata');
  }

  /**
   * @param dataSourceName
   * @returns serializer instance for dataSource
   */
  private serializerFor(dataSourceName: string): NaviMetadataSerializer {
    return this.yavinClient.pluginConfig.serializerFor(dataSourceName, 'metadata');
  }

  private dataSourceFor(dataSourceName?: string): DataSourceConfig {
    const { clientConfig } = this.yavinClient;
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

  @waitFor
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
    assert(
      `Metadata must have the requested data source loaded: ${dataSourceName}`,
      !dataSourceName || this.loadedDataSources.has(dataSourceName)
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
    assert('`dataSourceName` argument required', dataSourceName);
    return this.keg.getById(`metadata/${type}`, id, dataSourceName) as MetadataModelRegistry[K];
  }

  /**
   * Fetches from data source a single model instance given an identifier
   * @param type - model type
   * @param id - identifier value of model
   * @param dataSourceName - name of data source
   */
  @waitFor
  async fetchById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
    assert('`dataSourceName` argument required', dataSourceName);
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
  @waitFor
  findById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
    assert('`dataSourceName` argument required', dataSourceName);
    const kegRecord = this.keg.getById(`metadata/${type}`, id, dataSourceName);
    if (kegRecord && !kegRecord.partialData) {
      return Promise.resolve(this.getById(type, id, dataSourceName)) as Promise<MetadataModelRegistry[K]>;
    }
    return this.fetchById(type, id, dataSourceName);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'navi-metadata': NaviMetadataService;
  }
}
