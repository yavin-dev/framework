/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import AssetSerializer from './asset';
import { inject as service } from '@ember/service';
import { normalizeTableV2 } from './table';
import { normalizeMetricLabelV2 } from './metric-label';
import { normalizeLineChartV2 } from './line-chart';
import { normalizeBarChartV2 } from './bar-chart';
import { normalizeGoalGaugeV2 } from './goal-gauge';
import { normalizePieChartV2 } from './pie-chart';
import type Model from '@ember-data/model';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeVisualization(request: RequestV2, visualization: any, metadata: NaviMetadataService) {
  let normalized = visualization;
  if (visualization?.type === 'table') {
    normalized = normalizeTableV2(request, visualization, metadata);
  } else if (visualization?.type === 'metric-label') {
    normalized = normalizeMetricLabelV2(request, visualization);
  } else if (visualization?.type === 'line-chart') {
    normalized = normalizeLineChartV2(request, visualization);
  } else if (visualization?.type === 'bar-chart') {
    normalized = normalizeBarChartV2(request, visualization);
  } else if (visualization?.type === 'goal-gauge') {
    normalized = normalizeGoalGaugeV2(request, visualization);
  } else if (visualization?.type === 'pie-chart') {
    normalized = normalizePieChartV2(request, visualization);
  }
  return normalized;
}

export default class ReportSerializer extends AssetSerializer {
  @service declare naviMetadata: NaviMetadataService;

  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type as a DS model
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type: Model, report: object) {
    const normalized = super.normalize(type, report) as TODO;

    const { request, visualization } = normalized.data?.attributes;
    normalized.data.attributes.visualization = normalizeVisualization(request, visualization, this.naviMetadata);

    return normalized;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    report: ReportSerializer;
  }
}
