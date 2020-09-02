/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import { computed, set } from '@ember/object';
import VisualizationBase from './visualization';
import { validator, buildValidations } from 'ember-cp-validations';

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

    // checks that there is are no dimensions
    [`${CONFIG_PATH}.dimensions`]: [
      validator('presence', true),
      validator('length', { is: 0 }),
      validator('dimension-match')
    ]
  },
  {
    //Global Validation Options
    request: computed.readOnly('model._request')
  }
);

export default VisualizationBase.extend(Validations, {
  type: DS.attr('string', { defaultValue: 'apex-gauge' }),
  version: DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({
    defaultValue: () => {
      return {
        series: {
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
    this.isValidForRequest(request);
    /*
    RETURNS:
    series: {
      config: {
        baselineValue: number,
        goalValue: number,
        dimensions: [],
        metrics: [{ id: string, name: string }]
      }
    }
    */
    const metricContent = request.metrics.content[0];
    const goalValue = response.rows[0][metricContent.canonicalName] * 2;
    let meta = {
      series: {
        config: {
          baselineValue: 0,
          goalValue: goalValue,
          dimensions: [],
          metrics: [{ id: metricContent.metric.id, name: metricContent.metric.name }]
        }
      }
    };
    set(this, 'metadata', meta);
    return this;
  }
});
