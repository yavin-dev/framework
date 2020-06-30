/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

export const asyncFactsQueryStr = `
  query($id: string) {
    asyncQuery(op: FETCH, ids: [$id]) {
      edges {
        node {
          id
          query
          queryType
          status
          result {
            httpStatus
            contentLength
            responseBody
          }
        }
      }
    }
  }
`;

const query = gql`
  ${asyncFactsQueryStr}
`;

export default query;
