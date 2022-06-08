/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { DimensionColumn } from '../../models/metadata/dimension.js';
import type { Options } from '../../adapters/dimensions/interface.js';
import type NaviDimensionResponse from '../../models/navi-dimension-response.js';

export default interface NaviDimensionSerializer {
  normalize(dimension: DimensionColumn, rawPayload: unknown, options: Options): NaviDimensionResponse;
}
