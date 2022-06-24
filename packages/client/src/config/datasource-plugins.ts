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
type ServiceAdapter = ResolvedResolvedConfig[DataSourceService]['adapter'];
type ServiceSerializer = ResolvedResolvedConfig[DataSourceService]['serializer'];

export type DataSourcePluginMap = Record<string, DataSourcePlugins | undefined>;

export class DataSourcePluginConfig extends NativeWithCreate {
  @Config('client')
  private declare clientConfig: ClientConfig;

  #config: DataSourcePluginMap;
  #cache = new Map<string, ServiceAdapter | ServiceSerializer>();

  constructor(injector: Injector, config: DataSourcePluginMap) {
    super(injector);
    this.#config = config;
  }

  #getDataSourceType(dataSourceName: string) {
    return this.clientConfig.getDataSource(dataSourceName).type;
  }

  #getPluginFor(type: string) {
    return this.#config[type];
  }

  private getServicePluginFor<S extends keyof ResolvedResolvedConfig, T extends 'adapter' | 'serializer'>(
    dataSourceName: string,
    service: S,
    type: T
  ): ResolvedResolvedConfig[S][T] {
    const dataSourceType = this.#getDataSourceType(dataSourceName);
    const key = `${dataSourceType}.${service}.${type}`;
    let serviceThing = this.#cache.get(key);
    if (!serviceThing) {
      const dataSourcePlugin = this.#getPluginFor(dataSourceType);
      invariant(dataSourcePlugin, `The dataSource plugin for ${dataSourceType} must be configured`);
      serviceThing = dataSourcePlugin[service][type](getInjector(this));
      this.#cache.set(key, serviceThing);
    }
    return serviceThing;
  }

  adapterFor<S extends keyof ResolvedResolvedConfig>(
    dataSourceName: string,
    service: S
  ): ResolvedResolvedConfig[S]['adapter'] {
    return this.getServicePluginFor(dataSourceName, service, 'adapter');
  }

  serializerFor<S extends keyof ResolvedResolvedConfig>(
    dataSourceName: string,
    service: S
  ): ResolvedResolvedConfig[S]['serializer'] {
    return this.getServicePluginFor(dataSourceName, service, 'serializer');
  }
}
