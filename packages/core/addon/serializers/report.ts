/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import AssetSerializer from './asset';
import { inject as service } from '@ember/service';
import type Model from '@ember-data/model';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { RequestV2 } from '@yavin/client/request';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeVisualization(_request: RequestV2, visualization: any, _metadata: NaviMetadataService) {
  let normalized = visualization;
  let vizModelType = normalized?.vizModelType ?? normalized?.type;
  return { ...normalized, vizModelType };
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
