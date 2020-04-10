/*
 * Copyright 2020, Verizon Media
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';

const fragment = gql`
  fragment TableFragment on Table {
    id
    name
    description
    category
    cardinalitySize
    metrics {
      edges {
        node {
          id
          name
          description
          category
          valueType
          tags
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
          tags
        }
      }
    }
  }
`;

export default fragment;
