/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { ClientConfig } from './config/datasources.js';
import { DataSourcePluginConfig } from './config/datasource-plugins.js';
import { getInjector, setInjector } from './models/native-with-create.js';
import type { YavinClientConfig } from './config/datasources.js';
import type { DataSourcePlugins } from './config/datasource-plugins.js';
import type { ServicePlugins, Services } from './config/service-plugins.js';
import type FactService from './services/interfaces/fact.js';
import type MetadataService from './services/interfaces/metadata.js';
import type DimensionService from './services/interfaces/dimension.js';
import type { ClientServices, Injector, LookupType } from './models/native-with-create.js';
import type ServiceRegistry from './services/interfaces/registry.js';

interface PluginConfig {
  dataSourcePlugins: Record<string, DataSourcePlugins>;
  servicePlugins: ServicePlugins;
}

export class Client {
  get facts(): FactService {
    return getInjector(this).lookup('service', 'navi-facts');
  }
  get metadata(): MetadataService {
    return getInjector(this).lookup('service', 'navi-metadata');
  }
  get dimensions(): DimensionService {
    return getInjector(this).lookup('service', 'navi-dimension');
  }

  clientConfig: ClientConfig;
  pluginConfig: DataSourcePluginConfig;

  constructor(clientConfig: YavinClientConfig, plugins: PluginConfig) {
    this.clientConfig = new ClientConfig(clientConfig);
    setInjector(this, this.#createInjector(plugins.servicePlugins));
    this.pluginConfig = new DataSourcePluginConfig(getInjector(this), plugins.dataSourcePlugins);
  }

  #createInjector(servicePlugins: ServicePlugins): Injector {
    const serviceToPluginNames: Record<keyof ServiceRegistry, keyof PluginConfig['servicePlugins']> = {
      'request-decorator': 'requestDecorator',
      'navi-formatter': 'formatter',
      'navi-metadata': 'metadata',
      'navi-dimension': 'dimensions',
      'navi-facts': 'facts',
    };
    const serviceCache: Partial<Services> = {};
    const self = this;
    const injector: Injector = {
      lookup<T extends ClientServices>(type: LookupType, service: string) {
        if (type === 'config') {
          return { client: self.clientConfig, plugin: self.pluginConfig }[service];
        } else {
          const serviceName = serviceToPluginNames[service as T];
          let serviceInstance;
          if (serviceCache[serviceName]) {
            serviceInstance = serviceCache[serviceName];
          } else {
            serviceInstance = servicePlugins[serviceName](injector) as Services[typeof serviceName];
            serviceCache[serviceName] = serviceInstance;
          }
          return serviceInstance as ServiceRegistry[T];
        }
      },
    };
    return injector;
  }
}
