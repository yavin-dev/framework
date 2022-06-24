/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A serializer for an Elide response
 */
import NaviFactSerializer, { ResponseV1 } from '../../../serializers/facts/interface.js';
import { FactAdapterError } from '../../../adapters/facts/interface.js';
import type { AsyncQueryResponse, PageInfo, RequestOptions } from '../../../adapters/facts/interface.js';
import type { RequestV2 } from '../../../request.js';
import { canonicalizeColumn } from '../../../utils/column.js';
import NaviFactResponse from '../../../models/navi-fact-response.js';
import NaviFactError, { NaviErrorDetails } from '../../../errors/navi-adapter-error.js';
import { ExecutionResult } from 'graphql';
import type { FetchResult } from '@apollo/client/core/index.js';
import NativeWithCreate, { getInjector } from '../../../models/native-with-create.js';
import invariant from 'tiny-invariant';

//Elide response type guard
function isElideResponse(
  response?: FetchResult<AsyncQueryResponse> | ExecutionResult | Error
): response is FetchResult<AsyncQueryResponse> {
  return (response as FetchResult<AsyncQueryResponse>)?.data?.asyncQuery !== undefined;
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

export default class ElideFactsSerializer extends NativeWithCreate implements NaviFactSerializer {
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
    invariant(data, '`data` should be present in successful in a response');
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

    return new NaviFactResponse(getInjector(this), {
      rows,
      meta: {
        pagination: getPaginationFromPageInfo(pageInfo, options),
      },
    });
  }

  normalize(
    payload: FetchResult<AsyncQueryResponse>,
    request: RequestV2,
    options: RequestOptions = {}
  ): NaviFactResponse | undefined {
    const responseStr = payload?.data?.asyncQuery.edges[0].node.result?.responseBody;
    return responseStr ? this.processResponse(responseStr, request, options) : undefined;
  }

  extractError(
    payload: ExecutionResult | FetchResult<AsyncQueryResponse> | Error,
    _request: RequestV2,
    _options: RequestOptions
  ): NaviFactError {
    let errors: NaviErrorDetails[] = [];
    if (isElideResponse(payload)) {
      const responseStr = payload.data?.asyncQuery.edges[0].node.result?.responseBody;
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
