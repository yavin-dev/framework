/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { set } from '@ember/object';
import VisualizationBase from './visualization';
import NumberFormats from 'navi-core/utils/enums/number-formats';
import { attr } from '@ember-data/model';
import RequestFragment from './bard-request-v2/request';
import { ResponseV1 } from 'navi-data/addon/serializers/facts/interface';
import { buildValidations, validator } from 'ember-cp-validations';
import { readOnly } from '@ember/object/computed';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    'metadata.metricCid': validator('request-metric-exist', {
      dependentKeys: ['model._request.metricColumns.[]']
    })
  },
  {
    //Global Validation Options
    request: readOnly('model._request')
  }
);

export type MetricLabelConfig = {
  type: 'metric-label';
  version: 2;
  metadata: {
    format?: string;
    metricCid: string;
  };
};

export default class MetricLabelModel extends VisualizationBase.extend(Validations) implements MetricLabelConfig {
  @attr('string', { defaultValue: 'metric-label' })
  type!: MetricLabelConfig['type'];

  @attr('number', { defaultValue: 2 })
  version!: MetricLabelConfig['version'];

  @attr({ defaultValue: () => ({}) })
  metadata!: MetricLabelConfig['metadata'];

  /**
   * Rebuild config based on request and response
   *
   * @param request - request model fragment
   * @param response - response object
   * @return this object
   */
  rebuildConfig(request: RequestFragment, _response: ResponseV1) {
    const format = this.metadata.format || NumberFormats[0].format;

    set(this, 'metadata', { format, metricCid: request.metricColumns[0].cid });
    return this;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'metric-label': MetricLabelModel;
  }
}
