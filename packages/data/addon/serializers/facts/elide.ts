/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A serializer for an Elide response
 */

import EmberObject from '@ember/object';
import NaviFactSerializer, { ResponseV1 } from './interface';
import { AsyncQueryResponse, RequestV1 } from 'navi-data/adapters/facts/interface';

export default class ElideFactsSerializer extends EmberObject implements NaviFactSerializer {
  normalize(payload: AsyncQueryResponse, request: RequestV1): ResponseV1 | undefined {
    const requestTable: string = request.logicalTable.table;
    const responseStr = payload?.asyncQuery.edges[0].node.result?.responseBody;
    if (responseStr) {
      const response = JSON.parse(responseStr);
      const rawRows = response.data[requestTable].edges;
      return {
        rows: rawRows.map((row: { node: TODO }) => row.node),
        meta: {}
      };
    }
    return undefined;
  }
}
