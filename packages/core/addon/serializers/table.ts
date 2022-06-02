/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from './visualization';

export default class TableVisualizationSerializer extends VisualizationSerializer {
  // TODO: Implement serialize method to strip out unneeded fields
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    table: TableVisualizationSerializer;
  }
}
