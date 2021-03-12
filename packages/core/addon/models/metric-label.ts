/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationFragment from './visualization';
import { attr } from '@ember-data/model';
import { buildValidations, validator } from 'ember-cp-validations';
import { readOnly } from '@ember/object/computed';
import { set } from '@ember/object';
import NumberFormats from 'navi-core/utils/enums/number-formats';
import type { TypedVisualizationFragment } from './visualization';
import type RequestFragment from './bard-request-v2/request';
import type { ResponseV1 } from 'navi-data/serializers/facts/interface';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    'metadata.metricCid': validator('request-metric-exist', {
      dependentKeys: ['model._request.metricColumns.[]'],
    }),
  },
  {
    //Global Validation Options
    request: readOnly('model._request'),
  }
);

export type MetricLabelConfig = {
  type: 'metric-label';
  version: 2;
  metadata: {
    format?: string;
    metricCid?: string;
  };
};

export default class MetricLabelModel
  extends VisualizationFragment.extend(Validations)
  implements MetricLabelConfig, TypedVisualizationFragment {
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

    set(this, 'metadata', { format, metricCid: request.metricColumns[0]?.cid });
    return this;
  }
}

declare module './registry' {
  export interface FragmentRegistry {
    'metric-label': MetricLabelModel;
  }
}
