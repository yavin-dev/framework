/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { readOnly } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { attr } from '@ember-data/model';
import ChartVisualization, { DimensionSeries, MetricSeries } from './chart-visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import { DIMENSION_SERIES, chartTypeForRequest } from 'navi-core/utils/chart-data';
import type RequestFragment from './bard-request-v2/request';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';
import type { TypedVisualizationFragment } from './visualization';

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
      disabled: computed('chartType', function () {
        return this.chartType && this.chartType !== DIMENSION_SERIES;
      }),
      dependentKeys: ['model._request.metricColumns.[]'],
    }),
  },
  {
    //Global Validation Options
    chartType: computed('model._request.{dimensionColumns.[],metricColumns.[],interval}', function () {
      const request = get(this, 'request');
      return request && chartTypeForRequest(request);
    }),
    request: readOnly('model._request'),
  }
);

export type PieChartConfig = {
  type: 'pie-chart';
  version: 2;
  metadata: {
    series: MetricSeries | DimensionSeries;
  };
};

export default class PieChart extends ChartVisualization.extend(Validations) implements TypedVisualizationFragment {
  @attr('string', { defaultValue: 'pie-chart' })
  type!: PieChartConfig['type'];

  @attr('number', { defaultValue: 2 })
  version!: PieChartConfig['version'];

  @attr({
    defaultValue: () => {
      return {
        series: {
          type: null,
          config: {},
        },
      };
    },
  })
  metadata!: PieChartConfig['metadata'];

  get isDimensionSeries() {
    return this.metadata.series.type === 'dimension';
  }

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

declare module './registry' {
  export interface FragmentRegistry {
    'pie-chart': PieChart;
  }
}
