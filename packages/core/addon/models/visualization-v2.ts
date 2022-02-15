/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import type YavinVisualizationsService from 'navi-core/services/visualization';
import { cloneDeep } from 'lodash-es';
import type YavinVisualizationModel from 'navi-core/visualization/model';
import VisualizationFragment from './visualization';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  type: [
    validator('presence', {
      presence: true,
      ignoreBlank: true,
      message: 'The visualization must have a type',
    }),
  ],
});

export default class VisualizationModelV2<T = unknown> extends VisualizationFragment.extend(Validations) {
  @service declare visualization: YavinVisualizationsService;

  @attr('string')
  declare namespace: string;

  declare metadata: T;

  clone(): YavinVisualizationModel {
    const { manifest, metadata } = this;
    const model = manifest.createModel();
    model.metadata = cloneDeep(metadata);
    return model;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'visualization-v2': YavinVisualizationModel;
  }
}
