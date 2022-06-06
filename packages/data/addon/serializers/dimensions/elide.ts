/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import EmberObject from '@ember/object';
import type { AsyncQueryResponse } from '@yavin/client/adapters/facts/interface';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import type ElideDimensionMetadataModel from '@yavin/client/models/metadata/elide/dimension';
import NaviDimensionModel from '@yavin/client/models/navi-dimension';
import NaviDimensionResponse from '@yavin/client/models/navi-dimension-response';
import type { Options } from 'navi-data/adapters/dimensions/interface';
import { canonicalizeColumn } from '@yavin/client/utils/column';
import { getPaginationFromPageInfo } from '../facts/elide';
import type NaviDimensionSerializer from './interface';

export type ResponseEdge = {
  node: Record<string, string>;
};

export default class ElideDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  normalize(dimension: DimensionColumn, rawPayload?: AsyncQueryResponse, options: Options = {}): NaviDimensionResponse {
    const responseStr = rawPayload?.asyncQuery.edges[0].node.result?.responseBody;
    const { valueSource, suggestionColumns } = dimension.columnMetadata as ElideDimensionMetadataModel;
    const { tableId } = valueSource;
    assert('The tableId is defined', tableId);

    const injector = getOwner(this).lookup('service:client-injector');
    if (responseStr) {
      const response = JSON.parse(responseStr);
      const { edges, pageInfo } = response.data[tableId];
      const values = edges.map(
        (edge: ResponseEdge) =>
          new NaviDimensionModel(injector, {
            value: edge.node.col0,
            suggestions: suggestionColumns.reduce(
              (obj, col, idx) => ({
                ...obj,
                [canonicalizeColumn({ field: col.id, parameters: col.parameters })]: edge.node[`col${idx + 1}`],
              }),
              {}
            ),
            dimensionColumn: dimension,
          })
      );
      return new NaviDimensionResponse(injector, {
        values,
        meta: {
          pagination: getPaginationFromPageInfo(pageInfo, options),
        },
      });
    }
    return new NaviDimensionResponse(injector, { values: [] });
  }
}
