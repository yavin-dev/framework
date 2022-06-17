/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { DocumentNode } from 'graphql';
//@ts-ignore - import from generated file
import AsyncFactsMutation from './mutations/async-facts.js';
//@ts-ignore - import from generated file
import AsyncFactsCancel from './mutations/async-facts-cancel.js';
//@ts-ignore - import from generated file
import AsyncFactsQuery from './queries/async-facts.js';
//@ts-ignore - import from generated file
import TableExportFactsMutation from './mutations/export-facts.js';
//@ts-ignore - import from generated file
import TableExportFactsCancel from './mutations/export-facts-cancel.js';
//@ts-ignore - import from generated file
import TableExportFactsQuery from './queries/export-facts.js';

export const asyncFactsMutation = AsyncFactsMutation as DocumentNode;
export const asyncFactsCancel = AsyncFactsCancel as DocumentNode;
export const asyncFactsQuery = AsyncFactsQuery as DocumentNode;
export const tableExportFactsMutation = TableExportFactsMutation as DocumentNode;
export const tableExportFactsCancel = TableExportFactsCancel as DocumentNode;
export const tableExportFactsQuery = TableExportFactsQuery as DocumentNode;
