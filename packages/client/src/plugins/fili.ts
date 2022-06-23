/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import type { DataSourcePlugins } from '../config/datasource-plugins.js';
import type { Injector } from '../models/native-with-create.js';
import FiliFactsAdapter from './fili/adapters/facts.js';
import FiliFactsSerializer from './fili/serializers/facts.js';
import FiliMetadataAdapter from './fili/adapters/metadata.js';
import FiliMetadataSerializer from './fili/serializers/metadata.js';

export function buildFiliPlugin(): DataSourcePlugins {
  return {
    facts: {
      adapter: (injector: Injector) => new FiliFactsAdapter(injector),
      serializer: (injector: Injector) => new FiliFactsSerializer(injector),
    },
    metadata: {
      adapter: (injector: Injector) => new FiliMetadataAdapter(injector),
      serializer: (injector: Injector) => new FiliMetadataSerializer(injector),
    },
    dimensions: {
      adapter: () => {
        throw new Error('Fili dimension adapter does not exist yet');
      },
      serializer: () => {
        throw new Error('Fili dimension serializer does not exist yet');
      },
    },
  };
}
