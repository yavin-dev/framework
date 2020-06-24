/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import AsyncFactsMutation from './mutations/async-facts';
import AsyncFactsCancel from './mutations/async-facts-cancel';
import AsyncFactsQuery from './queries/async-facts';

export default {
  asyncFactsMutation: AsyncFactsMutation,
  asyncFactsCancel: AsyncFactsCancel,
  asyncFactsQuery: AsyncFactsQuery
};

declare module 'navi-data/gql/fact-queries';
