/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type VisualizationFragment from './visualization';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FragmentRegistry {}

type FilteredKeys<Registry, BaseClass> = {
  [K in keyof Registry]: Registry[K] extends BaseClass ? K : never;
}[keyof Registry];

export type VisualizationType = FilteredKeys<FragmentRegistry, VisualizationFragment>;

// Forces global fragments to be augmented (e.g. for other addons) into the registry
import './bard-request-v2/fragments/column';
import './bard-request-v2/fragments/filter';
import './bard-request-v2/fragments/sort';
import './bard-request-v2/request';
import './fragments/layout';
import './fragments/presentation';
import './fragments/scheduling-rules';
import './bar-chart';
import './goal-gauge';
import './line-chart';
import './metric-label';
import './pie-chart';
import './table';
