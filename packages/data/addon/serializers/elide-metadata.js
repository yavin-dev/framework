/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';

export default class GraphQLMetadataSerializer extends EmberObject {
  /**
   * @method normalize
   * normalizes the graphql metadata response
   * @param payload {Object} - graphql response payload
   * @returns {Object} - normalized JSON object
   */
  normalize(/*{ data: tables = [] }*/) {
    // TODO: Implement serializer
    return arguments;
  }
}
