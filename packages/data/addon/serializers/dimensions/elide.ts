/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
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
  dimensionModelFactory = getOwner(this).factoryFor('model:navi-dimension');
  responseFactory = getOwner(this).factoryFor('model:navi-dimension-response');

  normalize(
    dimension: DimensionColumn,
    rawPayload?: AsyncQueryResponse,
    options: ServiceOptions = {}
  ): NaviDimensionResponse {
    const responseStr = rawPayload?.asyncQuery.edges[0].node.result?.responseBody;
    const { valueSource, suggestionColumns } = dimension.columnMetadata as ElideDimensionMetadataModel;
    const { tableId } = valueSource;
    assert('The tableId is defined', tableId);

    if (responseStr) {
      const response = JSON.parse(responseStr);
      const { edges, pageInfo } = response.data[tableId];
      const values = edges.map((edge: ResponseEdge) =>
        this.dimensionModelFactory.create({
          value: edge.node.col0,
          suggestions: suggestionColumns.map((_, idx) => edge.node[`col${idx + 1}`]),
          dimensionColumn: dimension,
        })
      );
      return this.responseFactory.create({
        values,
        meta: {
          pagination: getPaginationFromPageInfo(pageInfo, options),
        },
      });
    }
    return this.responseFactory.create();
  }
}
