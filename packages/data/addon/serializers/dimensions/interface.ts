/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import type { Options } from 'navi-data/adapters/dimensions/interface';
import type NaviDimensionResponse from '@yavin/client/models/navi-dimension-response';

export default interface NaviDimensionSerializer extends EmberObject {
  normalize(dimension: DimensionColumn, rawPayload: unknown, options: Options): NaviDimensionResponse;
}
