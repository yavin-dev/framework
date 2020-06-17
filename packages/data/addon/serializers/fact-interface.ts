/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export interface ResponseV1 {
  rows: Array<object>;
  meta: {
    pagination?: { currentPage: number; rowsPerPage: number; perPage: number; numberOfResults: number };
  };
}

export default interface NaviFactSerializer {
  normalize(payload?: ResponseV1): ResponseV1 | undefined;
}
