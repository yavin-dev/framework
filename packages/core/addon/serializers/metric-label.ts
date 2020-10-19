/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import { MetricLabelConfig } from 'navi-core/models/metric-label';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { RequestV2 } from 'navi-data/addon/adapters/facts/interface';

export type LegacyMetricLabelConfig = {
  type: 'metric-label';
  version: 1;
  metadata: {
    description?: string;
    format?: string;
    metric: unknown;
  };
};

export function normalizeMetricLabelV2(
  request: RequestV2,
  visualization?: LegacyMetricLabelConfig | MetricLabelConfig
): MetricLabelConfig {
  if (visualization?.version === 2) {
    return visualization;
  }

  // Take the first metric column since there should be exactly one
  const metricColumn = request.columns.find(c => c.type === 'metric');
  if (metricColumn === undefined || metricColumn.cid === undefined) {
    throw new Error('There should be exactly one metric column in the request with a cid');
  }

  return {
    type: 'metric-label',
    version: 2,
    metadata: {
      format: visualization?.metadata.format,
      metricCid: metricColumn.cid
    }
  };
}

export default class MetricLabelSerializer extends VisualizationSerializer {}
