/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type MetadataModelRegistry from '../../models/metadata/registry.js';
import type { RequestOptions } from '../../adapters/facts/interface.js';

export default interface MetadataService {
  loadMetadata(options: RequestOptions): Promise<void>;

  /**
   * Provides an array of all loaded models for a given type
   * @param type - model type
   * @param dataSourceName - optional name of data source
   */
  all<K extends keyof MetadataModelRegistry>(type: K, dataSourceName?: string): Array<MetadataModelRegistry[K]>;

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
  ): MetadataModelRegistry[K] | undefined;

  /**
   * Fetches from data source a single model instance given an identifier
   * @param type - model type
   * @param id - identifier value of model
   * @param dataSourceName - name of data source
   */
  fetchById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined>;

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
  ): Promise<MetadataModelRegistry[K] | undefined>;
}
