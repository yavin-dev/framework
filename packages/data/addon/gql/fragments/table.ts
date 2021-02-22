/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

const fragment = gql`
  fragment TableFragment on Table {
    id
    name
    friendlyName
    description
    category
    cardinality
    isFact
    metrics {
      edges {
        node {
          id
          name
          friendlyName
          description
          category
          valueType
          tags
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
          friendlyName
          description
          category
          valueType
          tags
          columnType
          expression
          valueSourceType
          tableSource
          values
        }
      }
    }
    timeDimensions {
      edges {
        node {
          id
          name
          friendlyName
          description
          category
          valueType
          tags
          columnType
          expression
          supportedGrains {
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
`;

export default fragment;
