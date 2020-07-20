/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { RequestV1, RequestV2 } from 'navi-data/adapters/fact-interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResponsePayload = any;

export interface ResponseV1 {
  rows: Array<object>;
  meta: {
    pagination?: { currentPage: number; rowsPerPage: number; perPage: number; numberOfResults: number };
  };
}

export default interface NaviFactSerializer {
  /**
   * Normalizes a data source response into ResponseV1
   * @param payload - payload to normalize
   * @param request - request for response payload
   */
  normalize(payload: ResponsePayload, request: RequestV1 | RequestV2): ResponseV1 | undefined;
}
