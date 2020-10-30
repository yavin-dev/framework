/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import NaviDimensionSerializer from './interface';
import NaviDimensionModel from '../../models/navi-dimension';
import { AsyncQueryResponse } from 'navi-data/adapters/facts/interface';
import { getElideField } from '../../adapters/facts/elide';
import EmberObject from '@ember/object';
import { DimensionColumn } from 'navi-data/models/metadata/dimension';
import ElideDimensionMetadataModel from 'navi-data/models/metadata/elide/dimension';

export type ResponseEdge = {
  node: Dict<string>;
};

export default class ElideDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  normalize(dimension: DimensionColumn, rawPayload?: AsyncQueryResponse): NaviDimensionModel[] {
    const responseStr = rawPayload?.asyncQuery.edges[0].node.result?.responseBody;
    const { id, tableId } = (dimension.columnMetadata as ElideDimensionMetadataModel).lookupColumn;
    const match = new RegExp(`${tableId}\\.(.*)`).exec(id); // Remove table id from start of dimension e.g. tableA.dim1 => dim1
    const dimensionName = match ? match[1] : id;

    if (responseStr) {
      const response = JSON.parse(responseStr);
      return response.data[tableId as string].edges.map((edge: ResponseEdge) =>
        NaviDimensionModel.create({
          value: edge.node[getElideField(dimensionName, dimension.parameters)],
          dimensionColumn: dimension
        })
      );
    }
    return [];
  }
}
