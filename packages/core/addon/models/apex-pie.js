/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import { computed, set } from '@ember/object';
import VisualizationBase from './visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import { assignColors } from 'navi-core/utils/enums/denali-colors';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    // checks that there is exactly one metric
    'metadata.series.config.metrics': [validator('presence', true), validator('length', { is: 1 })],

    // checks that there is at least one dimension
    'metadata.series.config.dimensions': [validator('presence', true), validator('length', { min: 1 })]
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
    this.isValidForRequest(request);
    /*
    RETURNS:
    series: {
      type: string,
      config: {
        colors: ['string',  ...],
        legendVisible: boolean,
        metrics: [{ metric: string }, { metric: string }, ...],
        dimensions: [{ dimension: string }, { dimension: string }, ...]
      }
    }
    */
    let meta = {
      series: {
        config: {
          colors: assignColors(response.rows.length),
          dataLabelsVisible: true,
          legendVisible: true,
          metrics: request.metrics.content.map(item => {
            return { metric: item.metric.id };
          }),
          dimensions: request.dimensions.content.map(item => {
            return { dimension: item.dimension.id };
          })
        }
      }
    };
    set(this, 'metadata', meta);
    return this;
  }
});
