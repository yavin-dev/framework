/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import { computed, set } from '@ember/object';
import VisualizationBase from './visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import { assignColors } from 'navi-core/utils/enums/denali-colors';

const SERIES_PATH = 'metadata.series';
const CONFIG_PATH = `${SERIES_PATH}.config`;

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    // checks that there is exactly one metric, and the request metric matches the config metric
    [`${CONFIG_PATH}.metrics`]: [
      validator('presence', true),
      validator('length', { is: 1 }),
      validator('metric-match')
    ],

    // checks that there is at least one dimension, and the request dimensions match the config dimensions
    [`${CONFIG_PATH}.dimensions`]: [
      validator('presence', true),
      validator('length', { min: 1 }),
      validator('dimension-match')
    ]
  },
  {
    //Global Validation Options
    request: computed.readOnly('model._request')
  }
);

export default VisualizationBase.extend(Validations, {
  type: DS.attr('string', { defaultValue: 'apex-pie' }),
  version: DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({
    defaultValue: () => {
      return {
        series: {
          type: null,
          config: {}
        }
      };
    }
  }),

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {Object} request - request object
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request, response) {
    /*
    RETURNS:
    series: {
      type: string,
      config: {
        colors: ['string',  ...],
        dimensions: [{ id: string, name: string }, ...],
        metrics: [{ id: string, name: string }, ...]
      }
    }
    */
    let meta = {
      series: {
        config: {
          colors: [],
          metrics: request.metrics.content.map(item => {
            return { id: item.metric.id, name: item.metric.name };
          }),
          dimensions: request.dimensions.content.map(item => {
            return { id: item.dimension.id, name: item.dimension.name };
          })
        }
      }
    };
    let oldColors = this.getWithDefault('metadata.series.config.colors', []);
    let newColors = assignColors(response.rows.length);
    Array.prototype.splice.apply(newColors, [0, oldColors.length].concat(oldColors));
    set(meta, 'series.config.colors', newColors);
    set(this, 'metadata', meta);
    return this;
  }
});
