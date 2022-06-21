import type { DataSourcePluginConfig } from '@yavin/client/config/datasource-plugins';
import type { ClientConfig } from '@yavin/client/config/datasources';
import type { Injector, LookupType } from '@yavin/client/models/native-with-create';
import type DimensionService from '@yavin/client/services/interfaces/dimension';
import type FactService from '@yavin/client/services/interfaces/fact';
import type MetadataService from '@yavin/client/services/interfaces/metadata';
import type ServiceRegistry from '@yavin/client/services/interfaces/registry';
import type RequestDecoratorService from '@yavin/client/services/interfaces/request-decorator';
import invariant from 'tiny-invariant';

interface MockConfig extends Partial<ServiceRegistry> {
  client?: ClientConfig;
  plugin?: DataSourcePluginConfig;
}

export const mockInjector = (config: MockConfig = {}) =>
  ({
    lookup(type: LookupType, name: string) {
      invariant(['config', 'service'].includes(type), 'Valid lookup type');
      if (name in config) {
        return config[name as keyof MockConfig];
      }
      return null;
    },
  } as Injector);

export const Mock = (config: MockConfig = {}) => {
  return {
    meta: (service: MetadataService) => Mock({ ...config, 'navi-metadata': service }),
    dims: (service: DimensionService) => Mock({ ...config, 'navi-dimension': service }),
    facts: (service: FactService) => Mock({ ...config, 'navi-facts': service }),
    decorator: (service: RequestDecoratorService) => Mock({ ...config, 'request-decorator': service }),
    config: (clientConfig: ClientConfig) => Mock({ ...config, client: clientConfig }),
    plugin: (pluginConfig: (injector: Injector) => DataSourcePluginConfig) =>
      Mock({ ...config, plugin: pluginConfig(mockInjector(config)) }),
    build: () => mockInjector(config),
  };
};

export const nullInjector: Injector = mockInjector();
