/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const exportFactsQueryStr = `
  query($ids: [String!]) {
    tableExport(op: FETCH, ids: $ids) {
      edges {
        node {
          id
          query
          queryType
          resultType
          status
          result {
            httpStatus
            url
          }
        }
      }
    }
  }
`;

const query = gql`
  ${exportFactsQueryStr}
`;

export default query;
