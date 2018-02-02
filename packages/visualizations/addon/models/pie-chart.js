/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import DS from 'ember-data';
import VisualizationBase from './visualization';
import ChartVisualization from 'navi-visualizations/mixins/models/chart-visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import { DIMENSION_SERIES } from 'navi-visualizations/utils/chart-data';

const { computed, get, set } = Ember;

const SERIES_PATH = 'metadata.series';
const CONFIG_PATH = `${SERIES_PATH}.config`;

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations({
  //Global Validations
  [`${SERIES_PATH}.type`]: validator('chart-type'),

  //Dimension Series Validations
  [`${CONFIG_PATH}.metric`]: validator('request-metric-exist', {
    dependentKeys: [ 'model._request.metrics.[]' ]
  }),

  [`${CONFIG_PATH}.dimensionOrder`]: validator('request-dimension-order', {
    dependentKeys: [ 'model._request.dimensions.[]' ]
  }),

  [`${CONFIG_PATH}.dimensions`]: validator('length', { min: 1 }),
}, {
  //Global Validation Options
  chartType: DIMENSION_SERIES,
  request: computed.readOnly('model._request')
});

export default VisualizationBase.extend(Validations, ChartVisualization, {
  type:     DS.attr('string', { defaultValue: 'pie-chart'}),
  version:  DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({ defaultValue: () => {
    return {
      series: {
        type: DIMENSION_SERIES,
        config: {}
      }
    };
  }}),

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request, response) {
    this.isValidForRequest(request);

    let series = this.getSeriesBuilder(DIMENSION_SERIES).call(this, CONFIG_PATH, get(this,'validations'), request, response);
    set(this, 'metadata', { series });
    return this;
  }
});
