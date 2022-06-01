/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import AssetSerializer from './asset';
import { inject as service } from '@ember/service';
import { normalizeVisualization } from './report';
import type Model from '@ember-data/model';
import type NaviMetadataService from 'navi-data/services/navi-metadata';

export default class DashboardWidgetSerializer extends AssetSerializer {
  @service declare naviMetadata: NaviMetadataService;

  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type as a DS model
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type: Model, dashboardWidget: object) {
    const normalized = super.normalize(type, dashboardWidget) as TODO;

    const { requests, visualization } = normalized.data?.attributes;
    normalized.data.attributes.visualization = normalizeVisualization(requests[0], visualization, this.naviMetadata);

    return normalized;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'dashboard-widget': DashboardWidgetSerializer;
  }
}
