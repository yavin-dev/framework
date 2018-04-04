/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import DS from 'ember-data';
import VisualizationBase from './visualization';
import ChartVisualization from 'navi-visualizations/mixins/models/chart-visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import { METRIC_SERIES, DIMENSION_SERIES, DATE_TIME_SERIES, chartTypeForRequest } from 'navi-visualizations/utils/chart-data';

const { computed, get, set } = Ember;

const SERIES_PATH = 'metadata.axis.y.series';
const CONFIG_PATH = `${SERIES_PATH}.config`;

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations({
  //Global Validation
  [`${SERIES_PATH}.type`]: validator('chart-type'),

  //Metric Series Validation
  [`${CONFIG_PATH}.metrics`]: validator('request-metrics', {
    disabled: computed('chartType', function() {
      return get(this, 'chartType') !== METRIC_SERIES;
    }),
    dependentKeys: [ 'model._request.metrics.[]' ]
  }),

  [`${CONFIG_PATH}.metric`]: validator('request-metric-exist', {
    disabled: computed('chartType', function() {
      return get(this, 'chartType') !== DIMENSION_SERIES && get(this, 'chartType') !== DATE_TIME_SERIES;
    }),
    dependentKeys: [ 'model._request.metrics.[]' ]
  }),

  [`${CONFIG_PATH}.timeGrain`]: validator('request-time-grain', {
    disabled: computed('chartType', function () {
      return get(this, 'chartType') !== DATE_TIME_SERIES;
    }),
    dependentKeys: ['model._request.intervals.[]']
  }),

  [`${CONFIG_PATH}.dimensionOrder`]: validator('request-dimension-order', {
    disabled: computed('chartType', function() {
      return get(this, 'chartType') !== DIMENSION_SERIES;
    }),
    dependentKeys: [ 'model._request.dimensions.[]' ]
  }),

  //Dimension Series Validations
  [`${CONFIG_PATH}.dimensions`]: [
    validator('length', { min: 1 }, {
      disabled: computed('chartType', function() {
        return get(this, 'chartType') !== DIMENSION_SERIES;
      }),
      dependentKeys: [ 'model._request.dimensions.[]' ]
    }),
    validator('request-filters', {
      disabled: computed('chartType', function() {
        return get(this, 'chartType') !== DIMENSION_SERIES;
      }),
      dependentKeys: [ 'model._request.filters.@each.rawValues' ]
    })
  ]}, {
  //Global Validation Options
  chartType: computed('model._request.dimensions.[]', 'model._request.metrics.[]', 'model._request.intervals.firstObject.interval', function() {
    let request = get(this, 'request');
    return request && chartTypeForRequest(request);
  }),
  request: computed.readOnly('model._request')
});

export default VisualizationBase.extend(Validations, ChartVisualization, {
  type:     DS.attr('string', { defaultValue: 'line-chart'}),
  version:  DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({ defaultValue: () => {
    return {
      axis: {
        y: {
          series: {
            type: null,
            config: {}
          }
        }
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

    let chartType = chartTypeForRequest(request),
        series = this.getSeriesBuilder(chartType).call(this, CONFIG_PATH, get(this,'validations'), request, response);

    set(this, 'metadata', {
      axis: {
        y: { series }
      }
    });
    return this;
  }
});
