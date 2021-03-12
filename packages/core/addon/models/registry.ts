/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type VisualizationBase from './visualization';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FragmentRegistry {}

type FilteredKeys<Registry, BaseClass> = {
  [K in keyof Registry]: Registry[K] extends BaseClass ? K : never;
}[keyof Registry];

export type VisualizationType = FilteredKeys<FragmentRegistry, VisualizationBase>;
