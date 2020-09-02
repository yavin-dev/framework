/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import AssetSerializer from './asset';
import Model from '@ember-data/model';
import { normalizeTableV2 } from './table';

export default class DashboardWidgetSerializer extends AssetSerializer {
  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type as a DS model
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type: Model, dashboardWidget: TODO) {
    const normalized = super.normalize(type, dashboardWidget) as TODO;
    const { requests, visualization } = normalized.data?.attributes;
    if (visualization?.type === 'table') {
      const viz = normalizeTableV2(requests[0], visualization);
      Object.assign(normalized.data.attributes, { visualization: viz });
    }
    return normalized;
  }
}
