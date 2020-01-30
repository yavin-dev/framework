/*
 * Copyright 2020, Verizon Media
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import gql from 'graphql-tag';

const query = gql`
  {
    allMetrics {
      id
      name
      longName
      description
      category
      valueType
      defaultFormat
      supportedFunction {
        id
        name
        longName
        description
        arguments {
          name
          description
          valueType
        }
      }
    }
  }
`;

export default query;
