/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { readOnly } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { attr } from '@ember-data/model';
import ChartVisualization, { ChartSeries } from './chart-visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import { DIMENSION_SERIES, chartTypeForRequest } from 'navi-core/utils/chart-data';
import RequestFragment from './bard-request-v2/request';
import NaviFactResponse from 'navi-data/addon/models/navi-fact-response';

const SERIES_PATH = 'metadata.series';
const CONFIG_PATH = `${SERIES_PATH}.config`;

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    //Global Validations
    [`${SERIES_PATH}.type`]: validator('chart-type'),

    //Dimension Series Validations
    [`${CONFIG_PATH}.metricCid`]: validator('request-metric-exist', {
      disabled: computed('chartType', function() {
        return this.chartType && this.chartType !== DIMENSION_SERIES;
      }),
      dependentKeys: ['model._request.metricColumns.@each.parameters.{}']
    }),

    [`${CONFIG_PATH}.dimensions`]: validator('dimension-series', {
      disabled: computed('chartType', function() {
        return this.chartType && this.chartType !== DIMENSION_SERIES;
      }),
      dependentKeys: ['model._request.dimensionColumns.[]']
    })
  },
  {
    //Global Validation Options
    chartType: computed(
      'model._request.{dimensionColumns.[],metricColumns.[],intervals.firstObject.interval}',
      function() {
        const request = get(this, 'request');
        return request && chartTypeForRequest(request);
      }
    ),
    request: readOnly('model._request')
  }
);

export type PieChartConfig = {
  type: 'pie-chart';
  version: 2;
  metadata: {
    series: ChartSeries;
  };
};

export default class PieChart extends ChartVisualization.extend(Validations) {
  @attr('string', { defaultValue: 'pie-chart' })
  type!: PieChartConfig['type'];

  @attr('number', { defaultValue: 2 })
  version!: PieChartConfig['version'];

  @attr({
    defaultValue: () => {
      return {
        series: {
          type: null,
          config: {}
        }
      };
    }
  })
  metadata!: PieChartConfig['metadata'];

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request: RequestFragment, response: NaviFactResponse) {
    this.isValidForRequest(request);

    const chartType = chartTypeForRequest(request);
    const series = this.getSeriesBuilder(chartType).call(this, CONFIG_PATH, this.validations, request, response);
    this.metadata = { series };
    return this;
  }
}
