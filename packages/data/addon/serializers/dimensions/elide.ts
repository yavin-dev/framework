/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { assert } from '@ember/debug';
import NaviDimensionModel from '../../models/navi-dimension';
import NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import { getPaginationFromPageInfo } from '../facts/elide';
import type { AsyncQueryResponse } from 'navi-data/adapters/facts/interface';
import type NaviDimensionSerializer from './interface';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type ElideDimensionMetadataModel from 'navi-data/models/metadata/elide/dimension';
import type { ServiceOptions } from 'navi-data/services/navi-dimension';

export type ResponseEdge = {
  node: Record<string, string>;
};

export default class ElideDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  normalize(
    dimension: DimensionColumn,
    rawPayload?: AsyncQueryResponse,
    options: ServiceOptions = {}
  ): NaviDimensionResponse {
    const responseStr = rawPayload?.asyncQuery.edges[0].node.result?.responseBody;
    const { tableId } = (dimension.columnMetadata as ElideDimensionMetadataModel).lookupColumn;
    assert('The tableId is defined', tableId);

    if (responseStr) {
      const response = JSON.parse(responseStr);
      const { edges, pageInfo } = response.data[tableId];
      const values = edges.map((edge: ResponseEdge) =>
        NaviDimensionModel.create({
          value: edge.node.col0,
          dimensionColumn: dimension,
        })
      );
      return NaviDimensionResponse.create({
        values,
        meta: {
          pagination: getPaginationFromPageInfo(pageInfo, options),
        },
      });
    }
    return NaviDimensionResponse.create();
  }
}
