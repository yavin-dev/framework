/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Request } from '../../request.js';
import type { Task } from 'effection';

export type RequestOptions = {
  clientId?: string;
  requestId?: string;
  customHeaders?: Record<string, string>;
  timeout?: number;
  page?: number;
  perPage?: number;
  format?: string;
  cache?: boolean;
  queryParams?: Record<string, string | number>;
  dataSourceName?: string;
  fileName?: string;
};

export enum QueryStatus {
  COMPLETE = 'COMPLETE',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  CANCELLED = 'CANCELLED',
  TIMEDOUT = 'TIMEDOUT',
  FAILURE = 'FAILURE',
}

export enum TableExportResultType {
  CSV = 'CSV',
  JSON = 'JSON',
}

export type PageInfo = {
  startCursor: `${number}`;
  endCursor: `${number}`;
  totalRecords: number;
};

export type AsyncQueryResponse = {
  asyncQuery: {
    edges: [
      {
        node: {
          id: string;
          query: string;
          status: QueryStatus;
          result: AsyncQueryResult | null;
        };
      }
    ];
  };
};

export type TableExportResponse = {
  tableExport: {
    edges: [
      {
        node: {
          id: string;
          query: string;
          status: QueryStatus;
          result: TableExportResult | null;
        };
      }
    ];
  };
};
export class FactAdapterError extends Error {
  name = 'FactAdapterError';
}
export interface AsyncQueryResult {
  httpStatus: number;
  contentLength: number;
  responseBody: string;
  recordCount: number;
}
export interface TableExportResult {
  httpStatus: number;
  recordCount: number;
  url: URL;
  message: string;
}
export default interface NaviFactAdapter {
  fetchDataForRequest(request: Request, options: RequestOptions): Promise<unknown> | Task<unknown>;
  urlForFindQuery(request: Request, options: RequestOptions): string;
  urlForDownloadQuery(request: Request, options: RequestOptions): Promise<string> | Task<unknown>;
}
