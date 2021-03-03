/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import TablesQuery from './queries/tables';
import TableQuery from './queries/table';

export default {
  table: {
    all: TablesQuery,
    single: TableQuery,
  },
};

declare module 'navi-data/gql/metadata-queries';
