/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { RequestOptions } from '../../adapters/facts/interface.js';
import type { RequestV2 } from '../../request.js';
import type NaviFactResponse from '../../models/navi-fact-response.js';
import type NaviAdapterError from '../../errors/navi-adapter-error.js';

export type MetricValue = number | undefined | null;
export type DimensionValue = string | number | boolean | undefined | null;
export type RowMetadata = {
  isTotalRow?: boolean;
  hasPartialData?: boolean;
  isRollup?: boolean;
  isGrandTotal?: boolean;
};
export type RowValue = MetricValue | DimensionValue | RowMetadata;

export interface ResponseV1 {
  readonly rows: Array<Record<string, RowValue>>;
  readonly meta: {
    pagination?: {
      currentPage: number;
      rowsPerPage: number;
      numberOfResults: number;
    };
    missingIntervals?: string[];
    warning?: string[];
    errors?: {
      title: string;
      detail: string;
    }[];
  };
}

export default interface NaviFactSerializer {
  /**
   * Normalizes a data source response into ResponseV1
   * @param payload - payload to normalize
   * @param request - request for response payload
   */
  normalize(payload: unknown, request: RequestV2, options?: RequestOptions): NaviFactResponse | undefined;

  /**
   * Extract errors from server
   * @param payload - payload to normalize
   * @param request - request for response payload
   */
  extractError(payload: unknown, request: RequestV2, options?: RequestOptions): NaviAdapterError;
}
