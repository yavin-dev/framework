/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import LineChartSerializer, { LegacyLineChartConfig, normalizeLineChartV2 } from './line-chart';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type { BarChartConfig } from 'navi-core/models/bar-chart';
import type { LineChartConfig } from 'navi-core/models/line-chart';

export type LegacyBarChartConfig = {
  type: 'bar-chart';
  version: 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
};

export function normalizeBarChartV2(
  request: RequestV2,
  visualization: BarChartConfig | LegacyBarChartConfig
): BarChartConfig {
  const lineChartConfig: LegacyLineChartConfig | LineChartConfig = { ...visualization, type: 'line-chart' };
  const config = normalizeLineChartV2(request, lineChartConfig);

  const barChartConfig: BarChartConfig = { ...config, type: 'bar-chart' };
  return barChartConfig;
}

export default class BarChartSerializer extends LineChartSerializer {}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'bar-chart': BarChartSerializer;
  }
}
