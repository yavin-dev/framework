/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import { formTypeName } from 'navi-core/visualization/manifest';

export default class YavinVisualizationModel<T = unknown> extends Fragment {
  @attr('string')
  declare type: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare namespace: string;

  @attr()
  declare metadata: T;

  get typeName(): string {
    const { namespace, type } = this;
    return formTypeName(type, namespace);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    visualization: YavinVisualizationModel;
  }
}
