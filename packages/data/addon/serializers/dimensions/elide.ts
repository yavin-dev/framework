/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import NaviDimensionSerializer from './interface';
import NaviDimensionModel from '../../models/navi-dimension';
import { DimensionColumn } from '../../adapters/dimensions/interface';
import { AsyncQueryResponse } from 'navi-data/adapters/facts/interface';
import EmberObject from '@ember/object';

type ResponseEdge = {
  node: Dict<string>;
};

export default class ElideDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  normalize(dimension: DimensionColumn, rawPayload: unknown): NaviDimensionModel[] {
    const responseStr = (rawPayload as AsyncQueryResponse)?.asyncQuery.edges[0].node.result?.responseBody;
    const { id: dimensionName, tableId } = dimension.columnMetadata;

    if (responseStr && tableId) {
      const response = JSON.parse(responseStr);
      return response.data[tableId].edges.map((edge: ResponseEdge) =>
        NaviDimensionModel.create({
          value: edge.node[dimensionName], //TODO: Use canonicalized dimension name when Elide supports it
          dimensionColumn: dimension
        })
      );
    }
    return [];
  }
}
