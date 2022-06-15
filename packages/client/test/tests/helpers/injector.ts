import type { ClientConfig } from '@yavin/client/config/datasources';
import type { Injector } from '@yavin/client/models/native-with-create';
import type DimensionService from '@yavin/client/services/interfaces/dimension';
import type FactService from '@yavin/client/services/interfaces/fact';
import type MetadataService from '@yavin/client/services/interfaces/metadata';
import type ServiceRegistry from '@yavin/client/services/interfaces/registry';
import type RequestDecoratorService from '@yavin/client/services/interfaces/request-decorator';

interface MockConfig extends Partial<ServiceRegistry> {
  config?: ClientConfig;
}

export const mockInjector = (config: MockConfig = {}) =>
  ({
    lookup(type, name) {
      if (type === 'service' && name && config[name]) {
        return config[name];
      } else if (type === 'config' && config.config) {
        return config.config;
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
    config: (clientConfig: ClientConfig) => Mock({ ...config, config: clientConfig }),
    build: () => mockInjector(config),
  };
};

export const nullInjector: Injector = mockInjector();
