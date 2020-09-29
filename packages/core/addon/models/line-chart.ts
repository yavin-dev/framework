/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { readOnly } from '@ember/object/computed';
import { set, get, computed } from '@ember/object';
import { attr } from '@ember-data/model';
import ChartVisualization from './chart-visualization';
import { validator, buildValidations } from 'ember-cp-validations';
import {
  DIMENSION_SERIES,
  DATE_TIME_SERIES,
  chartTypeForRequest,
  DimensionSeriesValues
} from 'navi-core/utils/chart-data';
import RequestFragment from './bard-request-v2/request';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';

const SERIES_PATH = 'metadata.axis.y.series';
const CONFIG_PATH = `${SERIES_PATH}.config`;

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    //Global Validation
    [`${SERIES_PATH}.type`]: validator('chart-type'),

    [`${CONFIG_PATH}.timeGrain`]: validator('request-time-grain', {
      disabled: computed('chartType', function() {
        return this.chartType !== DATE_TIME_SERIES;
      }),
      dependentKeys: ['model._request.filters.[]']
    }),

    //Dimension Series Validations
    [`${CONFIG_PATH}.metricCid`]: validator('request-metric-exist', {
      disabled: computed('chartType', function() {
        return this.chartType !== DIMENSION_SERIES && this.chartType !== DATE_TIME_SERIES;
      }),
      dependentKeys: ['model._request.columns.[]']
    })
  },
  {
    //Global Validation Options
    chartType: computed('model._request.{dimensions.[],metrics.[],intervals.firstObject.interval}', function() {
      let request = get(this, 'request');
      return request && chartTypeForRequest(request);
    }),
    request: readOnly('model._request')
  }
);

export type SeriesType = MetricSeries['type'] | DimensionSeries['type'] | DateTimeSeries['type'];
export type SeriesConfig = MetricSeries['config'] | DimensionSeries['config'] | DateTimeSeries['config'];

export type MetricSeries = {
  type: 'metric';
  config: {};
};

export type DimensionSeries = {
  type: 'dimension';
  config: {
    metricCid: string;
    dimensions: DimensionSeriesValues[];
  };
};

export type DateTimeSeries = {
  type: 'dateTime';
  config: {
    timeGrain: string; // TODO more specific?
    metricCid: string;
  };
};

type NullSeries = { type: null; config: {} };

export type LineChartConfig = {
  type: 'line-chart';
  version: 2;
  metadata: {
    style?: {
      curve?: string;
      area?: boolean;
      stacked?: boolean;
    };
    axis: {
      y: {
        series: MetricSeries | DimensionSeries | DateTimeSeries | NullSeries;
      };
    };
  };
};

export default class LineChartVisualization extends ChartVisualization.extend(Validations) implements LineChartConfig {
  @attr('string', { defaultValue: 'line-chart' })
  type!: LineChartConfig['type'];
  @attr('number', { defaultValue: 2 })
  version!: LineChartConfig['version'];
  @attr({
    defaultValue(): LineChartConfig['metadata'] {
      return { axis: { y: { series: { type: null, config: {} } } } };
    }
  })
  metadata!: LineChartConfig['metadata'];

  /**
   * Rebuild config based on request and response
   *
   * @param request - request model fragment
   * @param response - response object
   * @return this object
   */
  rebuildConfig(request: RequestFragment, response: ResponseV1) {
    this.isValidForRequest(request);

    const chartType = chartTypeForRequest(request);
    const buildSeries = this.getSeriesBuilder(chartType).bind(this);
    const series = buildSeries(CONFIG_PATH, this.validations, request, response);
    const { style = {} } = this.metadata;

    set(this, 'metadata', {
      style,
      axis: {
        y: { series }
      }
    });
    return this;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'line-chart': LineChartVisualization;
  }
}
