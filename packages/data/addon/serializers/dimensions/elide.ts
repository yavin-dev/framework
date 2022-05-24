/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import EmberObject from '@ember/object';
import type { AsyncQueryResponse } from 'navi-data/adapters/facts/interface';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type ElideDimensionMetadataModel from 'navi-data/models/metadata/elide/dimension';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import type { ServiceOptions } from 'navi-data/services/navi-dimension';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { getPaginationFromPageInfo } from '../facts/elide';
import type NaviDimensionSerializer from './interface';

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
                [canonicalizeMetric({ metric: col.id, parameters: col.parameters })]: edge.node[`col${idx + 1}`],
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
