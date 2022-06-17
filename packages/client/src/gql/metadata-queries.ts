/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { DocumentNode } from 'graphql';
//@ts-ignore - import from generated file
import TablesQuery from './queries/tables.js';
//@ts-ignore - import from generated file
import TableQuery from './queries/table.js';

export const table = {
  all: TablesQuery as DocumentNode,
  single: TableQuery as DocumentNode,
};
