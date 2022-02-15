/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';
import type Model from '@ember-data/model';

export default class VisualizationV2Serializer extends JSONSerializer {
  normalize(typeClass: Model, hash: Record<string, unknown>): object {
    const normalized = super.normalize(typeClass, hash);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (normalized as any).data.attributes.vizModelType = 'visualization-v2';
    return normalized;
  }
}
