/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const asyncFactsMutationStr = `
  mutation($id: ID, $query: String) {
    asyncQuery(op: UPSERT, data: { id: $id, query: $query, resultType: $resultType, queryType: GRAPHQL_V1_0, status: QUEUED }) {
      edges {
        node {
          id
          query
          queryType
          resultType
          status
          result {
            contentLength
            responseBody
            httpStatus
            resultType
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
