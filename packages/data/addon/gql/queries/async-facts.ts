/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

const query = gql`
  query(id: $id) {
    asyncQuery(
      op: FETCH
      ids: [$id]
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

export default query;
