/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

export type RequestV1 = TODO;

export type RequestOptions = {
  clientId?: string;
  customHeaders?: Dict<string>;
  timeout?: number;
  page?: number;
  perPage?: number;
  format?: string;
  cache?: boolean;
  queryParams?: Dict<string>;
  dataSourceName?: string;
};

export const SORT_DIRECTIONS = ['desc', 'asc'];

export type Parameters = Dict<string>;

export type SortDirection = typeof SORT_DIRECTIONS[number];

export type ColumnType = 'metric' | 'dimension' | 'timeDimension';

export type Column = {
  field: string;
  parameters: Parameters;
  type: ColumnType;
  alias: string;
};

export type Filter = {
  field: string;
  parameters: Parameters;
  type: ColumnType;
  operator: string;
  values: string[];
};

export type Sort = {
  field: string;
  parameters: Parameters;
  direction: SortDirection;
};

// TODO: Remove V2 once V1 is no longer in use
export type RequestV2 = {
  filters: Filter[];
  columns: Column[];
  table: string;
  sort: Sort[];
  limit: TODO<string>;
  requestVersion: '2.0';
};

export default interface NaviFactAdapter {
  fetchDataForRequest(request: RequestV1, options: RequestOptions): Promise<TODO>;
  urlForFindQuery(request: RequestV1, options: RequestOptions): string;
}
