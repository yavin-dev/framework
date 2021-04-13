/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import NaviDimensionSerializer from './interface';
import NaviDimensionModel from '../../models/navi-dimension';
import { FiliDimensionResponse, DefaultField } from 'navi-data/adapters/dimensions/bard';
import { DimensionColumn } from 'navi-data/models/metadata/dimension';
import NaviDimensionResponse from 'navi-data/models/navi-dimension-response';

export default class BardDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  normalize(dimensionColumn: DimensionColumn, rawPayload: FiliDimensionResponse): NaviDimensionResponse {
    if (rawPayload?.rows.length) {
      const field = dimensionColumn.parameters?.field || DefaultField;
      const values = rawPayload.rows.map((row) => {
        //TODO remove when https://github.com/yahoo/fili/issues/1088 lands
        const value = 'desc' === field ? row.description : row[field];
        return NaviDimensionModel.create({ value, dimensionColumn });
      });
      return NaviDimensionResponse.create({ values, meta: rawPayload.meta });
    }
    return NaviDimensionResponse.create();
  }
}
