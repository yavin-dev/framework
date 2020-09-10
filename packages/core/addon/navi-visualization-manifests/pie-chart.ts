/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Pie Chart Visualization
 * This file registers the visualization with navi
 *
 */
import NaviVisualizationBaseManifest from './base';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

export default class PieChartManifest extends NaviVisualizationBaseManifest {
  name = 'pie-chart';
  niceName = 'Pie Chart';
  icon = 'pie-chart';

  typeIsValid(request: RequestFragment) {
    return (
      this.hasSingleTimeBucket(request) &&
      this.hasMetric(request) &&
      (this.hasGroupBy(request) || this.hasMultipleMetrics(request))
    );
  }
}
