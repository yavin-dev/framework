/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const asyncFactsMutationStr = `
  mutation($id: ID, $query: String, $resultType: QueryResultType, $resultFormatType: QueryResultFormatType) {
    asyncQuery(op: UPSERT, data: { id: $id, query: $query, resultType: $resultType, resultFormatType: $resultFormatType, queryType: GRAPHQL_V1_0, status: QUEUED }) {
      edges {
        node {
          id
          query
          resultType
          resultFormatType
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
