/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import type NaviDimensionSerializer from './interface';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type { ServiceOptions } from 'navi-data/services/navi-dimension';
import { Payload } from '../metadata/prometheus';

type DimensionValuePayload = Payload<string[]>;

export default class PrometheusDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  normalize(
    dimension: DimensionColumn,
    rawPayload: DimensionValuePayload,
    _options: ServiceOptions = {}
  ): NaviDimensionResponse {
    const values = rawPayload.data.map((value) => NaviDimensionModel.create({ dimensionColumn: dimension, value }));
    return NaviDimensionResponse.create({
      values: values,
      meta: {},
    });
  }
}
