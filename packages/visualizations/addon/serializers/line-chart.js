/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-visualizations/serializers/visualization';
import { parseMetricName } from 'navi-data/utils/metric';
import { get } from '@ember/object';

export default VisualizationSerializer.extend({
  /**
   * Normalizes payload so that it can be applied to models correctly
   * @override
   * @method normalize
   * @param type - class type
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type, visualization) {
    if(visualization) {
      let config = get(visualization, 'metadata.axis.y.series.config'),
          seriesType = get(visualization, 'metadata.axis.y.series.type');

      let metrics = get(config, 'metrics') || [get(config, 'metric')],
          metricObjects = metrics.map(metric => parseMetricName(metric));

      if(seriesType === 'metric') {
        visualization.metadata.axis.y.series.config.metrics = metricObjects;
      }else {
        visualization.metadata.axis.y.series.config.metric = metricObjects[0];
      }
    }

    return this._super(type, visualization);
  }
});
