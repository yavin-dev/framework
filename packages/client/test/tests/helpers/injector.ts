import type { Injector } from '@yavin/client/models/native-with-create';
import type DimensionService from '@yavin/client/services/interfaces/dimension';
import type FactService from '@yavin/client/services/interfaces/fact';
import type MetadataService from '@yavin/client/services/interfaces/metadata';
import type ServiceRegistry from '@yavin/client/services/interfaces/registry';

export const mockInjector = (config: Partial<ServiceRegistry> = {}) =>
  ({
    lookup(type, name) {
      if (type === 'service' && name && config[name]) {
        return config[name];
      }
      return null;
    },
  } as Injector);

export const Mock = (config: Partial<ServiceRegistry> = {}) => {
  return {
    meta: (service: MetadataService) => Mock({ ...config, 'navi-metadata': service }),
    dims: (service: DimensionService) => Mock({ ...config, 'navi-dimension': service }),
    facts: (service: FactService) => Mock({ ...config, 'navi-facts': service }),
    build: () => mockInjector(config),
  };
};

export const nullInjector: Injector = mockInjector();
