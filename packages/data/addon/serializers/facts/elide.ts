/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A serializer for an Elide response
 */

import EmberObject from '@ember/object';
import NaviFactSerializer from './interface';
import { AsyncQueryResponse, RequestV2 } from 'navi-data/adapters/facts/interface';
import { getElideField } from 'navi-data/adapters/facts/elide';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import NaviFactResponse from 'navi-data/models/navi-fact-response';

export default class ElideFactsSerializer extends EmberObject implements NaviFactSerializer {
  /**
   * @param payload - raw payload string
   * @param request - request object
   */
  private processResponse(payload: string, request: RequestV2): NaviFactResponse {
    const response = JSON.parse(payload);

    const { table } = request;
    // TODO revisit when Elide adds parameter support
    const elideFields = request.columns.map(({ field, parameters }) => getElideField(field, parameters));
    const normalizedFields = request.columns.map(({ field: metric, parameters }) =>
      // TODO rename with generic canonicalizeColumn
      canonicalizeMetric({ metric, parameters })
    );

    const rawRows = response.data[table].edges;
    const totalRows = rawRows.length;
    const totalFields = normalizedFields.length;
    const rows = new Array(totalRows);

    let r = totalRows;
    while (r--) {
      const rawRow = rawRows[r].node;
      const newRow: Record<string, unknown> = (rows[r] = {});
      let f = totalFields;
      while (f--) {
        newRow[normalizedFields[f]] = rawRow[elideFields[f]];
      }
    }

    return NaviFactResponse.create({ rows, meta: {} });
  }

  normalize(payload: AsyncQueryResponse, request: RequestV2): NaviFactResponse | undefined {
    const responseStr = payload?.asyncQuery.edges[0].node.result?.responseBody;
    return responseStr ? this.processResponse(responseStr, request) : undefined;
  }
}
