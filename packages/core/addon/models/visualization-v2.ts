/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { formTypeName } from 'navi-core/visualization/manifest';
import type YavinVisualizationsService from 'navi-core/services/visualization';
import type { YavinVisualizationManifest } from 'navi-core/visualization/manifest';

export default class YavinVisualizationModel<T = unknown> extends Fragment {
  @service declare visualization: YavinVisualizationsService;

  @attr('string')
  declare type: string;

  @attr('number')
  declare version: number;

  @attr('string')
  declare namespace: string;

  @attr()
  declare metadata: T;

  get typeName(): string {
    const { namespace, type } = this;
    return formTypeName(type, namespace);
  }

  get manifest(): YavinVisualizationManifest {
    return this.visualization.getVisualization(this.typeName);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'visualization-v2': YavinVisualizationModel;
  }
}
