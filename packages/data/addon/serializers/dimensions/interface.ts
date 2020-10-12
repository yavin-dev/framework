/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviDimensionModel from '../../models/navi-dimension';
import EmberObject from '@ember/object';
import { DimensionColumn } from 'navi-data/models/metadata/dimension';

export default interface NaviDimensionSerializer extends EmberObject {
  normalize(dimension: DimensionColumn, rawPayload: unknown): NaviDimensionModel[];
}
