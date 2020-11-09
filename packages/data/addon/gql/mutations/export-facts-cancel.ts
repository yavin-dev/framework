/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const exportFactsCancelMutationStr = `mutation($id: String) {
  tableExport(op: UPDATE, ids: [$id], data: { status: CANCELLED }) {
    edges {
      node {
        id
        status
      }
    }
  }
}`;

const mutation = gql`
  ${exportFactsCancelMutationStr}
`;

export default mutation;
