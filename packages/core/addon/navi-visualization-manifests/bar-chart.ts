/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Bar Chart Visualization
 * This file registers the visualization with navi
 *
 */
import NaviVisualizationBaseManifest from './base';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

export default class BarChartManifest extends NaviVisualizationBaseManifest {
  name = 'bar-chart';
  niceName = 'Bar Chart';
  icon = 'bar-chart';

  typeIsValid(request: RequestFragment) {
    return (
      this.hasMultipleMetrics(request) ||
      (this.hasMetric(request) && (this.hasGroupBy(request) || this.hasPotentialMultipleTimeBuckets(request)))
    );
  }
}
