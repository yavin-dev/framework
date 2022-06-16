/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NativeWithCreate from '../models/native-with-create.js';
import { Config, getInjector } from '../models/native-with-create.js';
import invariant from 'tiny-invariant';
import type { Injector } from '../models/native-with-create.js';
import type NaviFactAdapter from '../adapters/facts/interface.js';
import type NaviFactSerializer from '../serializers/facts/interface.js';
import type NaviMetadataAdapter from '../adapters/metadata/interface.js';
import type MetadataSerializer from '../serializers/metadata/interface.js';
import type NaviDimensionAdapter from '../adapters/dimensions/interface.js';
import type NaviDimensionSerializer from '../serializers/dimensions/interface.js';
import type { ReturnTypesOfObject } from '../utils/types.js';
import type { ClientConfig } from './datasources.js';

export interface DataSourcePlugins {
  facts: {
    adapter: (injector: Injector) => NaviFactAdapter;
    serializer: (injector: Injector) => NaviFactSerializer;
  };
  metadata: {
    adapter: (injector: Injector) => NaviMetadataAdapter;
    serializer: (injector: Injector) => MetadataSerializer;
  };
  dimensions: {
    adapter: (injector: Injector) => NaviDimensionAdapter;
    serializer: (injector: Injector) => NaviDimensionSerializer;
  };
}
type ResolvedResolvedConfig = ReturnTypesOfObject<DataSourcePlugins>;

type DataSourceService = keyof DataSourcePlugins;

export class DataSourcePluginConfig extends NativeWithCreate {
  @Config()
  private declare clientConfig: ClientConfig;

  #config: Record<string, DataSourcePlugins | undefined>;
  #adapterCache = new Map<string, ResolvedResolvedConfig[DataSourceService]['adapter']>();
  #serializerCache = new Map<string, ResolvedResolvedConfig[DataSourceService]['serializer']>();

  constructor(injector: Injector, config: Record<string, DataSourcePlugins | undefined>) {
    super(injector);
    this.#config = config;
  }

  #getDataSourceType(dataSourceName: string) {
    return this.clientConfig.getDataSource(dataSourceName).type;
  }

  #getPluginFor(type: string) {
    return this.#config[type];
  }

  adapterFor<S extends keyof ResolvedResolvedConfig>(
    dataSourceName: string,
    service: S
  ): ResolvedResolvedConfig[S]['adapter'] {
    const dataSourceType = this.#getDataSourceType(dataSourceName);
    const key = `${dataSourceType}.${service}`;
    let adapter = this.#adapterCache.get(key);
    if (!adapter) {
      const dataSourcePlugin = this.#getPluginFor(dataSourceType);
      invariant(dataSourcePlugin, `The dataSource plugin for ${dataSourceType} must be configured`);
      adapter = dataSourcePlugin[service].adapter(getInjector(this));
      this.#adapterCache.set(key, adapter);
    }
    return adapter;
  }

  serializerFor<S extends keyof ResolvedResolvedConfig>(
    dataSourceName: string,
    service: S
  ): ResolvedResolvedConfig[S]['serializer'] {
    const dataSourceType = this.#getDataSourceType(dataSourceName);
    const key = `${dataSourceType}.${service}`;
    let serializer = this.#serializerCache.get(key);
    if (!serializer) {
      const dataSourcePlugin = this.#getPluginFor(dataSourceType);
      invariant(dataSourcePlugin, `The dataSource plugin for ${dataSourceType} must be configured`);
      serializer = dataSourcePlugin[service].serializer(getInjector(this));
      this.#serializerCache.set(key, serializer);
    }
    return serializer;
  }
}
