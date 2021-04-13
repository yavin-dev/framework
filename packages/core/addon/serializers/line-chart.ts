/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import { canonicalizeMetric, parseMetricName } from 'navi-data/utils/metric';
import { assert } from '@ember/debug';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type { LineChartConfig } from 'navi-core/models/line-chart';
import type { ChartSeries, DimensionSeriesValues } from 'navi-core/models/chart-visualization';

type LegacyMetric = string | { metric: string; parameters?: {} };
type LegacyMetricSeries = { type: 'metric'; config: { metrics: LegacyMetric[] } };

export type LegacyDimensionSeries = {
  type: 'dimension';
  config: {
    metric: LegacyMetric;
    dimensionOrder: string[];
    dimensions: { name: string; values: Record<string, string | undefined> }[];
  };
};

type LegacyDateTimeSeries = { type: 'dateTime'; config: { metric: LegacyMetric; timeGrain: string } };

type LegacyChartSeries = LegacyMetricSeries | LegacyDimensionSeries | LegacyDateTimeSeries;
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

export function getMetricCidFromSeries(request: RequestV2, series: LegacyChartSeries): string {
  assert('The series should be dateTime or dimension', series?.type === 'dimension' || series?.type === 'dateTime');
  const parsedMetric = parseMetricName(series?.config?.metric);
  const canonicalName = canonicalizeMetric(parsedMetric);
  const column = request.columns.find(
    ({ field, parameters }) => canonicalizeMetric({ metric: field, parameters }) === canonicalName
  );
  if (!column?.cid) {
    throw new Error(`The ${canonicalName} metric should exist and have a cid`);
  }
  return column?.cid;
}

export function normalizeDimensionSeriesValues(request: RequestV2, series: LegacyChartSeries) {
  assert('The series should be dimension', series?.type === 'dimension');
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
      }, {}),
    };
  });
}

export function normalizeChartSeriesV2(request: RequestV2, series: LegacyChartSeries): ChartSeries {
  let newSeries: ChartSeries;
  if (series?.type === 'metric') {
    newSeries = { type: 'metric', config: {} };
  } else if (series?.type === 'dateTime') {
    const timeGrain = series?.config?.timeGrain;
    const metricCid = getMetricCidFromSeries(request, series);
    newSeries = {
      type: 'dateTime',
      config: {
        timeGrain,
        metricCid,
      },
    };
  } else {
    const dimensions = normalizeDimensionSeriesValues(request, series);
    const metricCid = getMetricCidFromSeries(request, series);
    newSeries = {
      type: 'dimension',
      config: {
        metricCid,
        dimensions,
      },
    };
  }
  return newSeries;
}

export function normalizeLineChartV2(
  request: RequestV2,
  visualization: LineChartConfig | LegacyLineChartConfig
): LineChartConfig {
  if (visualization.version === 2) {
    return visualization;
  }
  const style = visualization.metadata?.style;

  const newSeries = normalizeChartSeriesV2(request, visualization.metadata?.axis?.y?.series);

  return {
    type: 'line-chart',
    version: 2,
    metadata: {
      ...(style ? { style } : {}),
      axis: {
        y: {
          series: newSeries,
        },
      },
    },
  };
}

export default class LineChartSerializer extends VisualizationSerializer {}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'line-chart': LineChartSerializer;
  }
}
