/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { TaskGenerator } from 'ember-concurrency';
import type { ColumnType } from 'navi-data/models/metadata/column';

export type RequestV1 = TODO;

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

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'ini'
  | 'in'
  | 'notin'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'isnull'
  | 'bet'
  | 'nbet'
  | 'contains'
  | 'intervals';

export const SORT_DIRECTIONS = <const>['desc', 'asc'];

export type Parameters = Record<string, ParameterValue>;
export type ParameterValue = string | number | boolean;

export type SortDirection = typeof SORT_DIRECTIONS[number];

export type Column = {
  cid?: string;
  field: string;
  parameters: Parameters;
  type: ColumnType;
  alias?: string | null;
};

export type Filter = {
  field: string;
  parameters: Parameters;
  type: ColumnType;
  operator: FilterOperator;
  values: (string | number | boolean)[];
};

export type Sort = {
  field: string;
  parameters: Parameters;
  type: ColumnType;
  direction: SortDirection;
};

export type Rollup = {
  columnCids: string[];
  grandTotal: boolean;
};

// TODO: Remove V2 once V1 is no longer in use
export type RequestV2 = {
  filters: Filter[];
  columns: Column[];
  table: string;
  dataSource: string;
  rollup?: Rollup;
  sorts: Sort[];
  limit?: number | null;
  requestVersion: '2.0';
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
  fetchDataForRequest(request: RequestV1 | RequestV2, options: RequestOptions): TaskGenerator<unknown>;
  urlForFindQuery(request: RequestV1 | RequestV2, options: RequestOptions): string;
  urlForDownloadQuery(request: RequestV1 | RequestV2, options: RequestOptions): TaskGenerator<string>;
}
