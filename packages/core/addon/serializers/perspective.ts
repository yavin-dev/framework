/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization-v2';
export default class PerspectiveSerializer extends VisualizationSerializer {}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    perspective: PerspectiveSerializer;
  }
}
