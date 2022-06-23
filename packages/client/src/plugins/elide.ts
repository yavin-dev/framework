/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import type { DataSourcePlugins } from '../config/datasource-plugins.js';
import type { Injector } from '../models/native-with-create.js';
import ElideFactsAdapter from './elide/adapters/facts.js';
import ElideFactsSerializer from './elide/serializers/facts.js';
import ElideMetadataAdapter from './elide/adapters/metadata.js';
import ElideMetadataSerializer from './elide/serializers/metadata.js';

export function buildElidePlugin(): DataSourcePlugins {
  return {
    facts: {
      adapter: (injector: Injector) => new ElideFactsAdapter(injector),
      serializer: (injector: Injector) => new ElideFactsSerializer(injector),
    },
    metadata: {
      adapter: (injector: Injector) => new ElideMetadataAdapter(injector),
      serializer: (injector: Injector) => new ElideMetadataSerializer(injector),
    },
    dimensions: {
      adapter: () => {
        throw new Error('Elide dimension adapter does not exist yet');
      },
      serializer: () => {
        throw new Error('Elide dimension serializer does not exist yet');
      },
    },
  };
}
