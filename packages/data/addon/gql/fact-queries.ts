/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import AsyncFactsMutation from './mutations/async-facts.graphql';
import AsyncFactsCancel from './mutations/async-facts-cancel.graphql';
import AsyncFactsQuery from './queries/async-facts.graphql';
import TableExportFactsMutation from './mutations/export-facts.graphql';
import TableExportFactsCancel from './mutations/export-facts-cancel.graphql';
import TableExportFactsQuery from './queries/export-facts.graphql';

export default {
  asyncFactsMutation: AsyncFactsMutation,
  asyncFactsCancel: AsyncFactsCancel,
  asyncFactsQuery: AsyncFactsQuery,
  tableExportFactsMutation: TableExportFactsMutation,
  tableExportFactsCancel: TableExportFactsCancel,
  tableExportFactsQuery: TableExportFactsQuery,
};

declare module 'navi-data/gql/fact-queries';
