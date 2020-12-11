/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { RequestV1, RequestV2 } from 'navi-data/adapters/facts/interface';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import NaviAdapterError from 'navi-data/errors/navi-adapter-error';

export interface ResponseV1 {
  readonly rows: Array<Record<string, unknown>>;
  readonly meta: {
    pagination?: {
      currentPage: number;
      rowsPerPage: number;
      perPage: number;
      numberOfResults: number;
    };
  };
}

export default interface NaviFactSerializer {
  /**
   * Normalizes a data source response into ResponseV1
   * @param payload - payload to normalize
   * @param request - request for response payload
   */
  normalize(payload: unknown, request: RequestV1 | RequestV2): NaviFactResponse | undefined;

  /**
   * Extract errors from server
   * @param payload - payload to normalize
   * @param request - request for response payload
   */
  extractError(payload: unknown, request: RequestV1 | RequestV2): NaviAdapterError;
}
