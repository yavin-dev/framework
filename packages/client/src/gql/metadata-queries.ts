/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore - import from generated file
import TablesQuery from './queries/tables.js';
//@ts-ignore - import from generated file
import TableQuery from './queries/table.js';

const queries = {
  table: {
    all: TablesQuery,
    single: TableQuery,
  },
};

export default queries;
