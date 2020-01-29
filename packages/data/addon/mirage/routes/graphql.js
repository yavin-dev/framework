/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import graphQLHandler from '../handlers/graphql';

/**
 * Method to configure metadata endpoints
 */
export default function() {
  /**
   * /graphql endpoint
   */
  this.post('/graphql', graphQLHandler);
}
