/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';
import TableFragment from '../fragments/table';

const query = gql`
  query($ids: [String!]) {
    table(ids: $ids) {
      edges {
        node {
          ...TableFragment
        }
      }
    }
  }
  ${TableFragment}
`;

export default query;
