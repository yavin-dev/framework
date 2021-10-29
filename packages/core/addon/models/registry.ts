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
import 'navi-core/models/request/column';
import 'navi-core/models/request/filter';
import 'navi-core/models/request/rollup';
import 'navi-core/models/request/sort';
import 'navi-core/models/request';
import 'navi-core/models/fragments/layout';
import 'navi-core/models/fragments/presentation';
import 'navi-core/models/fragments/scheduling-rules';
import 'navi-core/models/fragments/delivery-format';
import 'navi-core/models/bar-chart';
import 'navi-core/models/goal-gauge';
import 'navi-core/models/line-chart';
import 'navi-core/models/metric-label';
import 'navi-core/models/pie-chart';
import 'navi-core/models/table';
