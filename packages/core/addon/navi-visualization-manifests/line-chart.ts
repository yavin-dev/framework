/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Line Chart Visualization
 * This file registers the visualization with navi
 *
 */
import NaviVisualizationBaseManifest from './base';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

export default class LineChartManifest extends NaviVisualizationBaseManifest {
  name = 'line-chart';
  niceName = 'Line Chart';
  icon = 'line-chart';

  typeIsValid(request: RequestFragment) {
    return this.hasMetric(request) && this.hasPotentialMultipleTimeBuckets(request);
  }
}
