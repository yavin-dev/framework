/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const asyncFactsMutationStr = `
mutation ($id: ID, $query: String, $asyncAfterSeconds: Int) {
  asyncQuery(
    op: UPSERT
    data: {id: $id, query: $query, queryType: GRAPHQL_V1_0, status: QUEUED, asyncAfterSeconds: $asyncAfterSeconds}
  ) {
    edges {
      node {
        id
        query
        queryType
        status
        result {
          contentLength
          responseBody
          httpStatus
        }
      }
    }
  }
}
`;

const mutation = gql`
  ${asyncFactsMutationStr}
`;

export default mutation;
