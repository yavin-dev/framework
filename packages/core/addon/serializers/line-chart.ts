/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import Model from '@ember-data/model';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import { LineChartConfig } from 'navi-core/models/line-chart';
import { canonicalizeMetric, parseMetricName } from 'navi-data/utils/metric';

type LegacyLineChartConfig = {
  type: 'line-chart';
  version: 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
};

export function normalizeLineChartV2(
  request: RequestV2,
  visualization: LineChartConfig | LegacyLineChartConfig
): LineChartConfig {
  if (visualization.version === 2) {
    return visualization;
  }
  debugger;
  const series = visualization.metadata?.axis?.y?.series;

  let metricCid;
  if (series?.config?.metric) {
    const parsedMetric = parseMetricName(series?.config?.metric);
    const canonicalName = canonicalizeMetric(parsedMetric);
    const column = request.columns.find(
      ({ field, parameters }) => canonicalizeMetric({ metric: field, parameters }) === canonicalName
    );
    metricCid = column?.cid;
    if (!metricCid) {
      throw new Error(`Could not find a matching column for metric ${series.config.metric}`);
    }
  }

  // TODO Keep existing config during normalization
  return {
    type: 'line-chart',
    version: 2,
    metadata: {
      axis: {
        y: {
          series: {
            type: series?.type,
            config: {
              // TODO: dimensions values need to be updated
              ...(series?.config?.dimensions ? { dimension: [] } : {}),
              ...(series?.config?.timeGrain ? { timeGrain: series?.config?.timeGrain } : {}),
              ...(metricCid ? { metricCid } : {})
            }
          }
        }
      }
    }
  };
}

export default class LineChartSerializer extends VisualizationSerializer {
  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type
   * @param visualization - json parsed object
   * @return normalized payload
   */
  normalize(type: Model, visualization: object) {
    return super.normalize(type, visualization);
  }
}
