/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { readOnly } from '@ember/object/computed';
import { METRIC_SERIES, DIMENSION_SERIES, DATE_TIME_SERIES, ChartType } from 'navi-core/utils/chart-data';
import type { Args } from '../pie-chart';
import type { ApexOptions } from 'apexcharts';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';
import {
  ChartSeries,
  DateTimeSeries,
  DimensionSeries,
  DimensionSeriesValues,
  MetricSeries,
} from 'navi-core/models/chart-visualization';
import { ResponseV1 } from 'navi-data/addon/serializers/facts/interface';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { maxDataByDimensions, topN } from 'navi-core/utils/data';
import { get } from '@ember/object';

function makeSeriesKey(d: DimensionSeriesValues) {
  return Object.keys(d.values)
    .sort()
    .map((k) => `${k}=${d.values[k]}`)
    .join(',');
}
export default class ApexChartComponent extends Component<Args> {
  extraClassNames?: string;

  @readOnly('args.model.firstObject.request') declare request: RequestFragment;
  @readOnly('args.model.firstObject.response') declare response: NaviFactResponse;

  /**
   * Base options for all apex charts, currently attempts to mimic our c3 charts styles
   */
  get baseOptions(): ApexOptions {
    return {
      chart: {
        height: '100%',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: false,
        },
      },
      legend: {
        position: 'bottom',
        floating: false,
        markers: {
          width: 10,
          height: 10,
          radius: 0,
        },
      },
      theme: {
        mode: 'light',
      },
      tooltip: {
        theme: 'light',
      },
      dataLabels: {
        style: {
          fontSize: '14px',
        },
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -15,
          },
        },
      },
    };
  }
  /**
   * Get a series builder based on type of chart
   *
   * @param type - type of chart series
   * @returns a series builder function
   */
  getSeriesBuilder(
    type: ChartType,
    request: RequestFragment,
    response: ResponseV1
  ): (config: unknown, validations: TODO) => ChartSeries {
    let builders = {
      [METRIC_SERIES]: this.buildMetricSeries,
      [DIMENSION_SERIES]: this.buildDimensionSeries,
      [DATE_TIME_SERIES]: this.buildDateTimeSeries,
    };

    return builders[type].call(this, request, response);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: RequestFragment,
    response: ResponseV1
  ): DimensionSeries {
    const metric = request.metricColumns[0];

    const responseRows = topN(
      maxDataByDimensions(response.rows, request.nonTimeDimensions, metric.canonicalName),
      metric.canonicalName,
      10
    );

    const currentDimensionSeries = [] as DimensionSeriesValues[];
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
    responseRows: Record<string, unknown>[]
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
