/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service, { inject as service } from '@ember/service';
import EmberArray from '@ember/array';
import { setOwner, getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { getDataSource, getDefaultDataSource, DataSource } from 'navi-data/utils/adapter';
import NaviMetadataSerializer, { EverythingMetadataPayload } from 'navi-data/serializers/metadata/interface';
import KegService, { KegRecord } from './keg';
import MetadataModelRegistry from 'navi-data/models/metadata/registry';
import NaviMetadataAdapter from '../adapters/metadata/interface';

type RequestOptions = {
  dataSourceName?: string;
};

export default class NaviMetadataService extends Service {
  @service
  private keg!: KegService;

  /**
   * @property {Array} loadedDataSources - list of data sources in which meta data has already been loaded
   */
  loadedDataSources: Set<string> = new Set();

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

  private dataSourceFor(dataSourceName?: string): DataSource {
    return dataSourceName ? getDataSource(dataSourceName) : getDefaultDataSource();
  }

  /**
   * @param payload
   * @param dataSourceName
   */
  private loadEverythingMetadataIntoKeg(payload: EverythingMetadataPayload, dataSourceName: string) {
    this.loadMetadataForType('table', payload.tables, dataSourceName);
    this.loadMetadataForType('dimension', payload.dimensions, dataSourceName);
    this.loadMetadataForType('timeDimension', payload.timeDimensions, dataSourceName);
    this.loadMetadataForType('columnFunction', payload.columnFunctions || [], dataSourceName);
    this.loadMetadataForType('metric', payload.metrics, dataSourceName);
    this.loadedDataSources.add(dataSourceName);
  }

  /**
   * Loads metadata based on type
   * @param type - type of metadata, table, dimension, or metric
   * @param metadataObjects - array of metadata objects
   */
  private loadMetadataForType<K extends keyof MetadataModelRegistry>(
    type: K,
    metadataObjects: Array<KegRecord>,
    dataSourceName: string
  ): EmberArray<MetadataModelRegistry[K]> {
    const owner = getOwner(this);
    metadataObjects.forEach(obj => setOwner(obj, owner));
    return this.keg.pushMany(`metadata/${type}`, metadataObjects, {
      namespace: dataSourceName
    }) as EmberArray<MetadataModelRegistry[K]>;
  }

  async loadMetadata(options: RequestOptions = {}) {
    const { type: dataSourceType, name: dataSourceName } = this.dataSourceFor(options.dataSourceName);
    if (!this.loadedDataSources.has(dataSourceName)) {
      const payload = await this.adapterFor(dataSourceType).fetchEverything(options);

      const normalized = this.serializerFor(dataSourceType).normalize('everything', payload, dataSourceName);
      if (normalized) {
        this.loadEverythingMetadataIntoKeg(normalized, dataSourceName);
      }
    }
    //TODO store promises, so two requests for the same metadata use the same promise
  }

  all<K extends keyof MetadataModelRegistry>(type: K, dataSourceName?: string): EmberArray<MetadataModelRegistry[K]> {
    assert(
      `Metadata must have the requested data source loaded: ${dataSourceName}`,
      !dataSourceName || this.loadedDataSources.has(dataSourceName)
    );
    return this.keg.all(`metadata/${type}`, dataSourceName) as EmberArray<MetadataModelRegistry[K]>;
  }

  getById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): MetadataModelRegistry[K] | undefined {
    return this.keg.getById(`metadata/${type}`, id, dataSourceName) as MetadataModelRegistry[K];
  }

  async fetchById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
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

  findById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
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
