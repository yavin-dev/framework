/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { topN, maxDataByDimensions } from 'navi-core/utils/data';
import { METRIC_SERIES, DIMENSION_SERIES, DATE_TIME_SERIES, ChartType } from '@yavin/c3/utils/chart-data';
import Visualization from 'navi-core/models/visualization';
import RequestFragment from 'navi-core/models/request';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import ColumnFragment from 'navi-core/models/request/column';
import { get } from '@ember/object';
import type { ResponseRow } from 'navi-data/models/navi-fact-response';

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

export type ChartSeries = MetricSeries | DimensionSeries | DateTimeSeries;

export type ChartVisualizationType = 'line-chart' | 'bar-chart';
export type ChartConfig<T extends ChartVisualizationType> = {
  type: T;
  version: 2;
  metadata: {
    style?: {
      curve?: string;
      area?: boolean;
      stacked?: boolean;
    };
    axis: {
      y: {
        series: ChartSeries;
      };
    };
  };
};

export type DimensionSeriesValues = { name: string; values: Record<string, unknown> };

function makeSeriesKey(d: DimensionSeriesValues) {
  return Object.keys(d.values)
    .sort()
    .map((k) => `${k}=${d.values[k]}`)
    .join(',');
}

export default class ChartVisualization extends Visualization {
  /**
   * Determines whether or not the chart is showing a dimension series
   */
  get isDimensionSeries(): boolean {
    return false;
  }

  /**
   * Invalidates the visualization every time if it is a dimension series
   */
  isValidForRequest(request: RequestFragment) {
    return super.isValidForRequest(request) && !this.isDimensionSeries;
  }

  /**
   * Get a series builder based on type of chart
   *
   * @param type - type of chart series
   * @returns a series builder function
   */
  getSeriesBuilder(
    type: ChartType
  ): (config: unknown, validations: any, request: RequestFragment, response: ResponseV1) => ChartSeries {
    let builders = {
      [METRIC_SERIES]: this.buildMetricSeries,
      [DIMENSION_SERIES]: this.buildDimensionSeries,
      [DATE_TIME_SERIES]: this.buildDateTimeSeries,
    };

    return builders[type];
  }

  private buildDimensionSeriesValues(request: RequestFragment, rows: ResponseV1['rows']): DimensionSeriesValues[] {
    const series: Record<string, DimensionSeriesValues> = {};
    const dimensions = request.nonTimeDimensions;
    rows.forEach((row) => {
      const values: Record<string, string | number | boolean> = {};
      const dimensionLabels: Array<string | number | boolean> = [];
      dimensions.forEach((dimension) => {
        const id = row[dimension.canonicalName];
        values[dimension.cid] = id as string | number | boolean;
        dimensionLabels.push(id as string);
      });
      //Use object key to dedup dimension value combinations
      series[Object.values(values).join('|')] = {
        name: dimensionLabels.join(','),
        values,
      };
    });
    return Object.values(series);
  }

  /**
   * Rebuild dimension series attributes based on request and response
   *
   * @param config - series config path
   * @param validations - validations object
   * @param request - request object
   * @param response - response object
   * @returns series config object
   */
  buildDimensionSeries(
    config: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validations: { attrs: any },
    request: RequestFragment,
    response: ResponseV1
  ): DimensionSeries {
    const validationAttrs = validations.attrs;
    //@ts-expect-error
    const currentMetric = get(this, config).metricCid;

    const isMetricValid = get(validationAttrs, config).metricCid.isValid;

    const metric = isMetricValid
      ? (request.metricColumns.find(({ cid }) => cid === currentMetric) as ColumnFragment)
      : request.metricColumns[0];

    const responseRows = topN(
      maxDataByDimensions(response.rows, request.nonTimeDimensions, metric.canonicalName),
      metric.canonicalName,
      10
    );

    //@ts-expect-error
    const currentDimensionSeries = (get(this, config).dimensions || []) as DimensionSeriesValues[];
    const dimensions = this.updateDimensionSeries(request, currentDimensionSeries, responseRows);

    return {
      type: DIMENSION_SERIES,
      config: {
        metricCid: metric.cid,
        dimensions,
      },
    };
  }

  private updateDimensionSeries(
    request: RequestFragment,
    currentDimensionSeries: DimensionSeriesValues[],
    responseRows: ResponseRow[]
  ) {
    const builtDimensionSeries = this.buildDimensionSeriesValues(request, responseRows);

    const existingSeries = new Set(currentDimensionSeries.map((d) => makeSeriesKey(d)));
    const validSeries = new Set(builtDimensionSeries.map((d) => makeSeriesKey(d)));

    const oldDimensionSeries = currentDimensionSeries.filter((d) => validSeries.has(makeSeriesKey(d)));
    const newDimensionSeries = builtDimensionSeries.filter((d) => !existingSeries.has(makeSeriesKey(d)));
    const dimensions = [...oldDimensionSeries, ...newDimensionSeries];
    return dimensions;
  }

  /**
   * Rebuild metric series attributes based on request and response
   *
   * @param config - series config path
   * @param validations - validations object
   * @param request - request object
   * @param response - response object
   * @returns series config object
   */
  buildMetricSeries(
    _config: string,
    _validations: unknown,
    _request: RequestFragment,
    _response: ResponseV1
  ): MetricSeries {
    return {
      type: METRIC_SERIES,
      config: {},
    };
  }

  /**
   * Rebuild date time series attributes based on request
   *
   * @param config - series config path
   * @param validations - validations object
   * @param request - request object
   * @param response - response object
   * @returns series config object
   */
  buildDateTimeSeries(
    _config: string,
    _validations: unknown,
    request: RequestFragment,
    _response: ResponseV1
  ): DateTimeSeries {
    return {
      type: DATE_TIME_SERIES,
      config: {
        metricCid: request.metricColumns[0].cid,
        timeGrain: 'year',
      },
    };
  }
}
