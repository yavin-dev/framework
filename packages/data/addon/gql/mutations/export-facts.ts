/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const exportFactsMutationStr = `
  mutation($id: ID, $query: String, $resultType: QueryResultType) {
    tableExport(op: UPSERT, data: { id: $id, query: $query, queryType: GRAPHQL_V1_0, resultType: $resultType, status: QUEUED }) {
      edges {
        node {
          id
          query
          queryType
          resultType
          status
          result {
            url
            httpStatus
          }
        }
      }
    }
  }
`;

const mutation = gql`
  ${exportFactsMutationStr}
`;

export default mutation;
