/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A serializer for an Elide response
 */

import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import NaviFactSerializer, { ResponseV1 } from '@yavin/client/serializers/facts/interface';
import { FactAdapterError } from '@yavin/client/adapters/facts/interface';
import type { AsyncQueryResponse, PageInfo, RequestOptions } from '@yavin/client/adapters/facts/interface';
import type { RequestV2 } from '@yavin/client/request';
import { canonicalizeColumn } from '@yavin/client/utils/column';
import NaviFactResponse from '@yavin/client/models/navi-fact-response';
import NaviFactError, { NaviErrorDetails } from '@yavin/client/errors/navi-adapter-error';
import { ExecutionResult } from 'graphql';
import { assert } from '@ember/debug';

//Elide response type guard
function isElideResponse(response?: AsyncQueryResponse | ExecutionResult | Error): response is AsyncQueryResponse {
  return (response as AsyncQueryResponse)?.asyncQuery !== undefined;
}

//Apollo Error type guard
function isApolloError(response?: AsyncQueryResponse | ExecutionResult | Error): response is ExecutionResult {
  return (response as ExecutionResult)?.errors !== undefined;
}

interface PaginationOptions {
  perPage?: number;
}
export function getPaginationFromPageInfo(
  pageInfo?: PageInfo,
  options?: PaginationOptions
): ResponseV1['meta']['pagination'] {
  if (!pageInfo) {
    return undefined;
  }
  const startCursor = Number(pageInfo.startCursor);
  const endCursor = Number(pageInfo.endCursor);
  // Use the perPage property if available (e.g. Getting the last page but there's only 2 results left)
  const rowsPerPage = options?.perPage ?? endCursor - startCursor;

  // Integer division of start position and page size (indexing starting with 1)
  const currentPage = rowsPerPage !== 0 ? Math.floor(startCursor / rowsPerPage) + 1 : 1;
  return {
    rowsPerPage,
    currentPage,
    numberOfResults: pageInfo.totalRecords,
  };
}

export default class ElideFactsSerializer extends EmberObject implements NaviFactSerializer {
  /**
   * @param payload - raw payload string
   * @param request - request object
   */
  private processResponse(payload: string, request: RequestV2, options: RequestOptions): NaviFactResponse {
    const response = JSON.parse(payload) as ExecutionResult<
      Record<string, { pageInfo: PageInfo; edges: Array<{ node: Record<string, unknown> }> }>
    >;
    const { table } = request;
    const elideFields = request.columns.map((_c, idx) => `col${idx}`);
    const normalizedFields = request.columns.map((col) => canonicalizeColumn(col));

    const { data } = response;
    assert('`data` should be present in successful in a response', data);
    const pageInfo = data[table].pageInfo;
    const rawRows = data[table].edges;
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

    return new NaviFactResponse(getOwner(this).lookup('service:client-injector'), {
      rows,
      meta: {
        pagination: getPaginationFromPageInfo(pageInfo, options),
      },
    });
  }

  normalize(
    payload: AsyncQueryResponse,
    request: RequestV2,
    options: RequestOptions = {}
  ): NaviFactResponse | undefined {
    const responseStr = payload?.asyncQuery.edges[0].node.result?.responseBody;
    return responseStr ? this.processResponse(responseStr, request, options) : undefined;
  }

  extractError(
    payload: ExecutionResult | AsyncQueryResponse | Error,
    _request: RequestV2,
    _options: RequestOptions
  ): NaviFactError {
    let errors: NaviErrorDetails[] = [];
    if (isElideResponse(payload)) {
      const responseStr = payload.asyncQuery.edges[0].node.result?.responseBody;
      if (responseStr) {
        const responseBody = JSON.parse(responseStr) as ExecutionResult;
        errors = (responseBody.errors || []).map((e) => ({ detail: e.message }));
      }
    }
    if (isApolloError(payload)) {
      errors = (payload.errors || []).map((e) => ({ detail: e.message }));
    }
    if (payload instanceof FactAdapterError) {
      errors = [{ title: payload.name, detail: payload.message }];
    }
    return new NaviFactError('Elide Request Failed', errors, payload);
  }
}
