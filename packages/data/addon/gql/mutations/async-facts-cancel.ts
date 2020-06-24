/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

const mutation = gql`
  mutation(id: $id) {
    asyncQuery(
      op: UPDATE
      ids: [$id]
      data: {
        status: CANCELLED
      }
    ) {
      edges { 
        node { 
          id
          status
        } 
      } 
    }
  }
`;

export default mutation;
