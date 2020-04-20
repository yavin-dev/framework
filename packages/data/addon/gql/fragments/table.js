/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

const fragment = gql`
  fragment TableFragment on Table {
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
          defaultFormat
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
        }
      }
    }
  }
`;

export default fragment;
