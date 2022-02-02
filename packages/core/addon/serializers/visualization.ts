/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';

export default class VisualizationSerializer extends JSONSerializer {
  /**
   * @property attrs - model attribute config while serialization
   */
  attrs = {
    // Prevent sending below attributes in legacy visualizations
    namespace: { serialize: false },
  };
}
