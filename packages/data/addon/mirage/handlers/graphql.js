/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import createGraphQLHandler from 'ember-cli-mirage-graphql/handler';
import schema from 'navi-data/gql/schema';

const OPTIONS = {
  argsMap: {
    undefined: {
      ids(records, _, ids) {
        return Array.isArray(ids) ? records.filter(record => ids.includes(record.id)) : records;
      }
    }
  }
}; // Options possibly added in the future

export default createGraphQLHandler(schema, OPTIONS);
