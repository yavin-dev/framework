/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviDimensionModel from '../../models/navi-dimension';
import { DimensionColumn } from '../../adapters/dimensions/interface';

export default interface NaviDimensionSerializer {
  normalize(dimension: DimensionColumn, rawPayload: unknown): NaviDimensionModel[];
}
