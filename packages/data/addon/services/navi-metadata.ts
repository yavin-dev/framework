/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service, { inject as service } from '@ember/service';
import EmberArray from '@ember/array';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { getDataSource, getDefaultDataSource } from 'navi-data/utils/adapter';
import NaviMetadataSerializer, {
  EverythingMetadataPayload,
  MetadataModelMap,
} from 'navi-data/serializers/metadata/base';
import KegService from './keg';
import type MetadataModelRegistry from 'navi-data/models/metadata/registry';
import NaviMetadataAdapter from '../adapters/metadata/interface';
import { NaviDataSource } from 'navi-config';
import { RequestOptions } from 'navi-data/adapters/facts/interface';

export type MetadataModelTypes = keyof MetadataModelRegistry;

export default class NaviMetadataService extends Service {
  @service
  private keg!: KegService;

  /**
   * @property {Array} loadedDataSources - list of data sources in which meta data has already been loaded
   */
  loadedDataSources: Set<string> = new Set();

  private loadMetadataPromises: Record<string, Promise<void>> = {};

  /**
   * @param dataSourceType
   * @returns  adapter instance for type
   */
  private adapterFor(dataSourceType: string): NaviMetadataAdapter {
    return getOwner(this).lookup(`adapter:metadata/${dataSourceType}`);
  }

  /**
   * @param dataSourceType
   * @returns serializer instance for type
   */
  private serializerFor(dataSourceType: string): NaviMetadataSerializer {
    return getOwner(this).lookup(`serializer:metadata/${dataSourceType}`);
  }

  private dataSourceFor(dataSourceName?: string): NaviDataSource {
    return dataSourceName ? getDataSource(dataSourceName) : getDefaultDataSource();
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
  ): EmberArray<MetadataModelRegistry[K]> {
    return this.keg.insertMany(`metadata/${type}`, metadataObjects, {
      namespace: dataSourceName,
    }) as EmberArray<MetadataModelRegistry[K]>;
  }

  private async loadAndProcessMetadata(dataSource: NaviDataSource, options: RequestOptions): Promise<void> {
    const { type: dataSourceType, name: dataSourceName } = dataSource;
    const payload = await this.adapterFor(dataSourceType).fetchEverything(options);
    const normalized = this.serializerFor(dataSourceType).normalize('everything', payload, dataSourceName);
    if (normalized) {
      this.loadEverythingMetadataIntoKeg(normalized, dataSourceName);
    }
  }

  loadMetadata(options: RequestOptions = {}): Promise<void> {
    const dataSource = this.dataSourceFor(options.dataSourceName);
    const existingPromise = this.loadMetadataPromises[dataSource.name];

    if (existingPromise) {
      return existingPromise;
    }

    const newPromise = this.loadAndProcessMetadata(dataSource, options);

    //cache promise so we don't execute multiple load fetches
    this.loadMetadataPromises[dataSource.name] = newPromise;

    //if load fails remove from cache so we can retry
    newPromise.catch(() => delete this.loadMetadataPromises[dataSource.name]);

    return newPromise;
  }

  /**
   * Provides an array of all loaded models for a given type
   * @param type - model type
   * @param dataSourceName - optional name of data source
   */
  all<K extends keyof MetadataModelRegistry>(type: K, dataSourceName?: string): EmberArray<MetadataModelRegistry[K]> {
    assert(
      `Metadata must have the requested data source loaded: ${dataSourceName}`,
      !dataSourceName || this.loadedDataSources.has(dataSourceName)
    );
    return this.keg.all(`metadata/${type}`, dataSourceName) as EmberArray<MetadataModelRegistry[K]>;
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
  async fetchById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
    assert('`dataSourceName` argument required', dataSourceName);
    const { type: dataSourceType } = this.dataSourceFor(dataSourceName);
    const rawPayload = await this.adapterFor(dataSourceType).fetchById(type, id, { dataSourceName });
    const normalized = rawPayload
      ? this.serializerFor(dataSourceType).normalize(type, rawPayload, dataSourceName)
      : undefined;

    if (normalized) {
      const model = this.loadMetadataForType(type, normalized, dataSourceName);
      return model?.firstObject as MetadataModelRegistry[K];
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
