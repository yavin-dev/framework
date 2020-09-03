/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

const query = gql`
  query {
    table {
      edges {
        node {
          id
          name
          description
          category
          cardinality
          metrics {
            edges {
              node {
                id
                name
                description
                category
                valueType
                columnTags
                columnType
                expression
              }
            }
          }
          dimensions {
            edges {
              node {
                id
                name
                description
                category
                valueType
                columnTags
                columnType
                expression
              }
            }
          }
          timeDimensions {
            edges {
              node {
                id
                name
                description
                category
                valueType
                columnTags
                columnType
                expression
                supportedGrain {
                  edges {
                    node {
                      grain
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default query;
