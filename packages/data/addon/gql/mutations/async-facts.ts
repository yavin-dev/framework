/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

const mutation = gql`
  mutation(id: $id, query: $query) {
    asyncQuery(
      op: UPSERT
      data: {
        id: $id
        query: $query
        queryType: GRAPHQL_V1_0
        status: QUEUED
      }
    ) {
      edges { 
        node { 
          id 
          query 
          queryType 
          status 
          result {
            id
            contentLength
            responseBody
            status
          }
        } 
      } 
    }
  }
`;

export default mutation;
