/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import { parseMetricName } from 'navi-data/utils/metric';
import { get } from '@ember/object';

export default VisualizationSerializer.extend({
  /**
   * Normalizes payload so that it can be applied to models correctly
   * @override
   * @method normalize
   * @param type - class type as a DS model
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type, visualization) {
    if (visualization) {
      let metric = get(visualization, 'metadata.metric');
      visualization.metadata.metric = parseMetricName(metric);
    }

    return this._super(type, visualization);
  }
});
