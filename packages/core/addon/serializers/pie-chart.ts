/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from 'navi-core/serializers/visualization';
import { LegacyDimensionSeries, normalizeChartSeriesV2 } from './line-chart';
import { assert } from '@ember/debug';
import type { PieChartConfig } from 'navi-core/models/pie-chart';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';

type LegacyMetricSeries = { type: 'metric'; config: { metrics: { metric: string; parameters?: {} }[] } };
type LegacyPieChartSeries = LegacyMetricSeries | LegacyDimensionSeries;
export type LegacyPieChartConfig = {
  type: 'pie-chart';
  version: 1;
  metadata: {
    series: LegacyPieChartSeries;
  };
};

export function normalizePieChartV2(
  request: RequestV2,
  visualization: PieChartConfig | LegacyPieChartConfig
): PieChartConfig {
  if (visualization.version === 2) {
    return visualization;
  }

  const newSeries = normalizeChartSeriesV2(request, visualization.metadata?.series);
  assert(
    `The updated series should be either metric or dimension`,
    newSeries.type === 'metric' || newSeries.type === 'dimension'
  );

  return {
    type: 'pie-chart',
    version: 2,
    metadata: {
      series: newSeries,
    },
  };
}

export default class PieChartSerializer extends VisualizationSerializer {}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'pie-chart': PieChartSerializer;
  }
}
