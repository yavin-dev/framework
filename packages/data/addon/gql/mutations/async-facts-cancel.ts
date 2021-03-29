/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const asyncFactsCancelMutationStr = `
  mutation($id: ID) {
    asyncQuery(op: UPDATE, data: { id: $id, status: CANCELLED }) {
      edges {
        node {
          id
          status
        }
      }
    }
  }
`;

const mutation = gql`
  ${asyncFactsCancelMutationStr}
`;

export default mutation;
