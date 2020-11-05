/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import { LineChartConfig } from 'navi-core/models/line-chart';
import { canonicalizeMetric, parseMetricName } from 'navi-data/utils/metric';
import { DimensionSeriesValues } from 'navi-core/models/chart-visualization';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LegacyChartSeries = any;
export type LegacyLineChartConfig = {
  type: 'line-chart';
  version: 1;
  metadata: {
    style?: {
      curve?: string;
      area?: boolean;
      stacked?: boolean;
    };
    axis: {
      y: {
        series: LegacyChartSeries;
      };
    };
  };
};

export function getMetricCidFromSeries(request: RequestV2, series: LegacyChartSeries) {
  const parsedMetric = parseMetricName(series?.config?.metric);
  const canonicalName = canonicalizeMetric(parsedMetric);
  const column = request.columns.find(
    ({ field, parameters }) => canonicalizeMetric({ metric: field, parameters }) === canonicalName
  );
  return column?.cid;
}

export function normalizeDimensionSeriesValues(request: RequestV2, series: LegacyChartSeries) {
  if (series?.config?.dimensions) {
    return series?.config?.dimensions.map((series: DimensionSeriesValues) => {
      return {
        name: series.name,
        values: Object.keys(series.values).reduce((newValues: Record<string, unknown>, key) => {
          const dimensionColumn = request.columns.find(({ field, type }) => type === 'dimension' && field === key);
          if (!dimensionColumn?.cid) {
            throw new Error(`Could not find a matching column for dimension ${key}`);
          }
          newValues[dimensionColumn.cid] = series.values[key];
          return newValues;
        }, {})
      };
    });
  }
  return undefined;
}

export function normalizeLineChartV2(
  request: RequestV2,
  visualization: LineChartConfig | LegacyLineChartConfig
): LineChartConfig {
  if (visualization.version === 2) {
    return visualization;
  }
  const series = visualization.metadata?.axis?.y?.series;

  const style = visualization.metadata?.style;

  let metricCid;
  if (series?.config?.metric) {
    metricCid = getMetricCidFromSeries(request, series);
    if (!metricCid) {
      throw new Error(`Could not find a matching column for metric ${series.config.metric}`);
    }
  }

  let timeGrain = series?.config?.timeGrain;
  let dimensions = normalizeDimensionSeriesValues(request, series);

  return {
    type: 'line-chart',
    version: 2,
    metadata: {
      ...(style ? { style } : {}),
      axis: {
        y: {
          series: {
            type: series?.type,
            config: {
              ...(dimensions ? { dimensions } : {}),
              ...(timeGrain ? { timeGrain } : {}),
              ...(metricCid ? { metricCid } : {})
            }
          }
        }
      }
    }
  };
}

export default class LineChartSerializer extends VisualizationSerializer {}
