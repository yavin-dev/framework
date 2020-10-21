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
import { ResponseV1 } from 'navi-data/addon/serializers/facts/interface';
import RequestFragment from './bard-request-v2/request';

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
        return get(this, 'chartType') !== DIMENSION_SERIES;
      }),
      dependentKeys: ['model._request.metricColumns.@each.parameters.{}']
    }),

    [`${CONFIG_PATH}.dimensions`]: validator('length', {
      min: 1,
      disabled: computed('chartType', function() {
        return this.chartType && this.chartType !== DIMENSION_SERIES;
      }),
      dependentKeys: ['model._request.dimensionColumns.[]'],
      allowNone: false
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

type PieChartMetadata = {
  series: ChartSeries;
};

export default class PieChart extends ChartVisualization.extend(Validations) {
  @attr('string', { defaultValue: 'pie-chart' })
  type!: string;

  @attr('number', { defaultValue: 1 })
  version!: number;

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
  metadata!: PieChartMetadata;

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request: RequestFragment, response: ResponseV1) {
    this.isValidForRequest(request);

    const chartType = chartTypeForRequest(request);
    const series = this.getSeriesBuilder(chartType).call(this, CONFIG_PATH, this.validations, request, response);
    this.metadata = { series };
    return this;
  }
}
