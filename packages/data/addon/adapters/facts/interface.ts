/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import NaviFactsModel from 'navi-data/models/navi-facts';
import { ColumnType } from 'navi-data/models/metadata/column';

export type RequestV1 = TODO;

export type RequestOptions = {
  clientId?: string;
  requestId?: string;
  customHeaders?: Dict<string>;
  timeout?: number;
  page?: number;
  perPage?: number;
  format?: string;
  cache?: boolean;
  queryParams?: Dict<string | number>;
  dataSourceName?: string;
};

export type FilterOperator = 'eq' | 'neq' | 'in' | 'notin' | 'lt' | 'le' | 'gt' | 'ge' | 'isnull' | 'notnull' | 'bet';

export const SORT_DIRECTIONS = ['desc', 'asc'];

export type Parameters = Dict<string>;

export type SortDirection = typeof SORT_DIRECTIONS[number];

export type Column = {
  field: string;
  parameters: Parameters;
  type: ColumnType;
  alias?: string | null;
};

export type Filter = {
  field: string;
  parameters: Parameters;
  type: ColumnType;
  operator: string;
  values: (string | number)[];
};

export type Sort = {
  field: string;
  parameters: Parameters;
  type: ColumnType;
  direction: SortDirection;
};

// TODO: Remove V2 once V1 is no longer in use
export type RequestV2 = {
  filters: Filter[];
  columns: Column[];
  table: string;
  dataSource: string;
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
  FAILURE = 'FAILURE'
}

export enum QueryResultType {
  EMBEDDED = 'EMBEDDED'
}

export interface AsyncQuery {
  requestId: string;
  request: RequestV1 | RequestV2;
  status: QueryStatus;
  result: AsyncQueryResult | null;
  createdOn: Date;
  updatedOn: Date;
  then: () => NaviFactsModel;
  cancel: () => void;
}

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

export interface AsyncQueryResult {
  httpStatus: number;
  contentLength: number;
  resultType: QueryResultType;
  responseBody: string;
}

export default interface NaviFactAdapter {
  fetchDataForRequest(request: RequestV1 | RequestV2, options: RequestOptions): Promise<TODO>;
  urlForFindQuery(request: RequestV1 | RequestV2, options: RequestOptions): string;
}
