/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import type { MetricLabelConfig } from 'navi-core/models/metric-label';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';

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
  const metricColumn = request.columns.find((c) => c.type === 'metric');
  if (metricColumn === undefined || metricColumn.cid === undefined) {
    throw new Error('There should be exactly one metric column in the request with a cid');
  }

  return {
    type: 'metric-label',
    version: 2,
    metadata: {
      format: visualization?.metadata.format,
      metricCid: metricColumn.cid,
    },
  };
}

export default class MetricLabelSerializer extends VisualizationSerializer {}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'metric-label': MetricLabelSerializer;
  }
}
