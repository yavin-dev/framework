/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Pie Chart Visualization
 * This file registers the visualization with navi
 *
 */
import NaviVisualizationBaseManifest from 'navi-core/navi-visualization-manifests/base';
import RequestFragment from 'navi-core/models/request';

export default class PieChartManifest extends NaviVisualizationBaseManifest {
  name = 'pie-chart';
  niceName = 'Pie Chart';
  icon = 'chart-pie';

  typeIsValid(request: RequestFragment) {
    return (
      this.hasMetric(request) &&
      (!this.hasTimeGroupBy(request) || this.hasExplicitSingleTimeBucket(request)) &&
      (this.hasGroupBy(request) || this.hasMultipleMetrics(request))
    );
  }
}
