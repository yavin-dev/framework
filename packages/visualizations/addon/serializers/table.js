/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-visualizations/serializers/visualization';
import { parseMetricName } from 'navi-data/utils/metric';
import { get } from '@ember/object';

const TRANSFORMS = {
  metric:    (column) => Object.assign(column, { field: parseMetricName(column.field) }),
  threshold: (column) => Object.assign(column, { field: parseMetricName(column.field) }),
  dimension: (column) => Object.assign(column, { field: { dimension: column.field } }),
  dateTime:  (column) => Object.assign(column, { field: { dateTime: column.field } })
};

export default VisualizationSerializer.extend({
  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type as a DS model
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type, visualization) {
    if(visualization) {
      let columns = get(visualization, 'metadata.columns').map(column => {
        if(typeof get(column, 'field') === 'string') {
          let type = get(column, 'type');

          return TRANSFORMS[type](column);
        }
        return column;
      });
      Object.assign(visualization.metadata, { columns });
    }
    return this._super(type, visualization);
  }
});
