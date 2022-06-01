/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import AsyncFactsMutation from './mutations/async-facts.graphql';
import AsyncFactsCancel from './mutations/async-facts-cancel.graphql';
import AsyncFactsQuery from './queries/async-facts.graphql';
import TableExportFactsMutation from './mutations/export-facts.graphql';
import TableExportFactsCancel from './mutations/export-facts-cancel.graphql';
import TableExportFactsQuery from './queries/export-facts.graphql';

export const asyncFactsMutation = AsyncFactsMutation;
export const asyncFactsCancel = AsyncFactsCancel;
export const asyncFactsQuery = AsyncFactsQuery;
export const tableExportFactsMutation = TableExportFactsMutation;
export const tableExportFactsCancel = TableExportFactsCancel;
export const tableExportFactsQuery = TableExportFactsQuery;
