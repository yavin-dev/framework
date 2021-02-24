/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import NaviDimensionSerializer from './interface';
import NaviDimensionModel from '../../models/navi-dimension';
import { AsyncQueryResponse } from 'navi-data/adapters/facts/interface';
import EmberObject from '@ember/object';
import { DimensionColumn } from 'navi-data/models/metadata/dimension';
import ElideDimensionMetadataModel from 'navi-data/models/metadata/elide/dimension';

export type ResponseEdge = {
  node: Record<string, string>;
};

export default class ElideDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  normalize(dimension: DimensionColumn, rawPayload?: AsyncQueryResponse): NaviDimensionModel[] {
    const responseStr = rawPayload?.asyncQuery.edges[0].node.result?.responseBody;
    const { tableId } = (dimension.columnMetadata as ElideDimensionMetadataModel).lookupColumn;

    if (responseStr) {
      const response = JSON.parse(responseStr);
      return response.data[tableId as string].edges.map((edge: ResponseEdge) =>
        NaviDimensionModel.create({
          value: edge.node.col0,
          dimensionColumn: dimension,
        })
      );
    }
    return [];
  }
}
