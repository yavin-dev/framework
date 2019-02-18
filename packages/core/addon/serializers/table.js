/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import { parseMetricName } from 'navi-data/utils/metric';
import { get } from '@ember/object';
import { isPresent, isNone } from '@ember/utils';
import omit from 'lodash/omit';

/**
 * Returns metric column attributes given a canonical name
 *
 * @method parseStringField
 * @param {String} field - the metric's canonical name
 * @return {Object} - parsed metric name and parameters column attributes
 */
function parseStringField(field) {
  let { metric, parameters } = parseMetricName(field);

  return {
    name: metric,
    parameters
  };
}

/**
 * Maps a column `field` property to `attributes`
 *
 * @method transformFieldToAttributes
 * @param {String} type - the column type
 * @param {String|Object} - the column field
 * @return {Object} - attributes object
 */
function transformFieldToAttributes(type, field) {
  if (typeof field === 'string') {
    return ['metric', 'threshold'].includes(type) ? parseStringField(field) : { name: field };
  }

  return Object.assign({}, { name: field[type === 'threshold' ? 'metric' : type] }, omit(field, [type, 'metric']));
}

export default VisualizationSerializer.extend({
  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type as a DS model
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type, visualization) {
    if (visualization) {
      let columns = get(visualization, 'metadata.columns').map(column => {
        let { type, field, format, attributes } = column;

        if (isPresent(field)) {
          attributes = transformFieldToAttributes(type, field);
          if (!isNone(format)) {
            attributes.format = format;
          }
        }

        return Object.assign({}, { attributes }, omit(column, ['field', 'format']));
      });
      Object.assign(visualization.metadata, { columns });
    }
    return this._super(type, visualization);
  }
});
