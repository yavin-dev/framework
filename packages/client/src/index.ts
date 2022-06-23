/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { ClientConfig } from './config/datasources.js';
import { DataSourcePluginConfig, DataSourcePluginMap } from './config/datasource-plugins.js';
import { getInjector, setInjector } from './models/native-with-create.js';
import { buildFiliPlugin } from './plugins/fili.js';
import { buildElidePlugin } from './plugins/elide.js';
import type { YavinClientConfig } from './config/datasources.js';
import type { DataSourcePlugins } from './config/datasource-plugins.js';
import type { ServicePlugins, Services } from './config/service-plugins.js';
import type FactServiceInterface from './services/interfaces/fact.js';
import type MetadataServiceInterface from './services/interfaces/metadata.js';
import type DimensionServiceInterface from './services/interfaces/dimension.js';
import type { ClientServices, Injector, LookupType } from './models/native-with-create.js';
import type ServiceRegistry from './services/interfaces/registry.js';
import RequestDecoratorService from './services/request-decorator.js';
import FormatterService from './services/formatter.js';
import MetadataService from './services/metadata.js';
import FactsService from './services/fact.js';

interface PluginConfig {
  dataSourcePlugins: Record<string, DataSourcePlugins>;
  servicePlugins: ServicePlugins;
}

export class Client {
  get facts(): FactServiceInterface {
    return getInjector(this).lookup('service', 'navi-facts');
  }
  get metadata(): MetadataServiceInterface {
    return getInjector(this).lookup('service', 'navi-metadata');
  }
  get dimensions(): DimensionServiceInterface {
    return getInjector(this).lookup('service', 'navi-dimension');
  }

  clientConfig: ClientConfig;
  pluginConfig: DataSourcePluginConfig;

  constructor(clientConfig: YavinClientConfig, plugins: PluginConfig) {
    this.clientConfig = new ClientConfig(clientConfig);

    const servicePlugins = this.getServicePluginConfig(plugins.servicePlugins);
    const dataSourcePlugins = this.getDataSourcePluginConfig(plugins.dataSourcePlugins);
    setInjector(this, this.#createInjector(servicePlugins));
    this.pluginConfig = new DataSourcePluginConfig(getInjector(this), dataSourcePlugins);
  }

  protected getServicePluginConfig(servicePlugins: ServicePlugins): ServicePlugins {
    const services: ServicePlugins = {
      requestDecorator: (injector: Injector) => new RequestDecoratorService(injector),
      formatter: (injector: Injector) => new FormatterService(injector),
      metadata: (injector: Injector) => new MetadataService(injector),
      facts: (injector: Injector) => new FactsService(injector),
      dimensions: (_injector: Injector) => {
        throw new Error('Dimension service does not exist yet');
      },
    };
    Object.assign(services, servicePlugins);
    return services;
  }

  protected getDataSourcePluginConfig(dataSourcePlugins: DataSourcePluginMap): DataSourcePluginMap {
    const bard = buildFiliPlugin();
    const elide = buildElidePlugin();
    const dataSources: DataSourcePluginMap = {
      bard,
      elide,
    };
    Object.assign(dataSources, dataSourcePlugins);
    return dataSources;
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
    const injector: Injector = {
      lookup: <T extends ClientServices>(type: LookupType, service: string) => {
        if (type === 'config') {
          return { client: this.clientConfig, plugin: this.pluginConfig }[service];
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
