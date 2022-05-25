/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
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

export type ColumnType = 'metric' | 'dimension' | 'timeDimension';
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

export type Request = RequestV2;
