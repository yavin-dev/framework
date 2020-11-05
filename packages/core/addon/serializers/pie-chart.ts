/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { PieChartConfig } from 'navi-core/models/pie-chart';
import VisualizationSerializer from 'navi-core/serializers/visualization';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import { getMetricCidFromSeries, normalizeDimensionSeriesValues } from './line-chart';

export type LegacyPieChartConfig = {
  type: 'pie-chart';
  version: 1;
  metadata: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series: any;
  };
};

export function normalizePieChartV2(
  request: RequestV2,
  visualization: PieChartConfig | LegacyPieChartConfig
): PieChartConfig {
  if (visualization.version === 2) {
    return visualization;
  }
  const series = visualization.metadata?.series;

  let metricCid;
  if (series?.config?.metric) {
    metricCid = getMetricCidFromSeries(request, series);
    if (!metricCid) {
      throw new Error(`Could not find a matching column for metric ${series.config.metric}`);
    }
  }

  let dimensions = normalizeDimensionSeriesValues(request, series);

  return {
    type: 'pie-chart',
    version: 2,
    metadata: {
      series: {
        type: series?.type,
        config: {
          ...(dimensions ? { dimensions } : {}),
          ...(metricCid ? { metricCid } : {})
        }
      }
    }
  };
}

export default class PieChartSerializer extends VisualizationSerializer {}
