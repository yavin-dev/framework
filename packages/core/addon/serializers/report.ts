/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import AssetSerializer from './asset';
import Model from '@ember-data/model';
import { normalizeTableV2 } from './table';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { normalizeMetricLabelV2 } from './metric-label';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeVisualization(request: RequestFragment, visualization?: any) {
  if (visualization?.type === 'table') {
    return normalizeTableV2(request, visualization);
  } else if (visualization?.type === 'metric-label') {
    return normalizeMetricLabelV2(request, visualization);
  }
  return visualization;
}

export default class ReportSerializer extends AssetSerializer {
  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type as a DS model
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type: Model, report: object) {
    const normalized = super.normalize(type, report) as TODO;

    const { request, visualization } = normalized.data?.attributes;
    const viz = normalizeVisualization(request, visualization);
    Object.assign(normalized.data.attributes, { visualization: viz });

    return normalized;
  }
}
