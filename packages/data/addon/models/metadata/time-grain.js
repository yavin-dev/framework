/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Time Grain Fragment Object
 */
import EmberObject, { computed } from '@ember/object';

import { getOwner } from '@ember/application';

export default EmberObject.extend({
  /**
   * @property {String} name
   */
  name: undefined,

  /**
   * @property {String} longName
   */
  longName: undefined,

  /**
   * @property {String} description
   */
  description: undefined,

  /**
   * @property {String} retention
   */
  retention: undefined,

  /**
   * @property {Array} metricIds - array of metric ids
   */
  metricIds: undefined,

  /**
   * @property {Array} dimensionIds - array of dimension ids
   */
  dimensionIds: undefined,

  /**
   * @property {Array} metrics - array of metric models
   */
  metrics: computed(function() {
    return this.get('metricIds').map(metricId => {
      return getOwner(this)
        .lookup('service:keg')
        .getById('metadata/metric', metricId);
    });
  }),

  /**
   * @property {Array} dimensions - array of dimension models
   */
  dimensions: computed(function() {
    return this.get('dimensionIds').map(dimensionId => {
      return getOwner(this)
        .lookup('service:keg')
        .getById('metadata/dimension', dimensionId);
    });
  })
});
