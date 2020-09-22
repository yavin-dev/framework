/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import { MetricLabelConfig } from 'navi-core/models/metric-label';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

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
  request: RequestFragment,
  visualization?: LegacyMetricLabelConfig | MetricLabelConfig
): MetricLabelConfig {
  if (visualization?.version === 2) {
    return visualization;
  }

  const metricColumn = request.columns.filter(c => c.type === 'metric')[0];
  if (metricColumn === undefined) {
    throw new Error('There should be exactly one metric column in the request');
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
