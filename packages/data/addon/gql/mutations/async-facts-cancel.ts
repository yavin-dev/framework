/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const asyncFactsCancelMutationStr = `mutation($id: String) {
  asyncQuery(op: UPDATE, ids: [$id], data: { status: CANCELLED }) {
    edges {
      node {
        id
        status
      }
    }
  }
}`;

const mutation = gql`
  ${asyncFactsCancelMutationStr}
`;

export default mutation;
