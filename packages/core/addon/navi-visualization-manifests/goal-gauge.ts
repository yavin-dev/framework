/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Goal Gauge Visualization
 * This file registers the visualization with navi
 */
import NaviVisualizationBaseManifest from './base';
import RequestFragment from 'navi-core/models/request';

export default class GoalGaugeManifest extends NaviVisualizationBaseManifest {
  name = 'goal-gauge';

  niceName = 'Goal Gauge';

  icon = 'dashboard';

  typeIsValid(request: RequestFragment) {
    return (
      this.hasNoGroupBy(request) &&
      this.hasSingleMetric(request) &&
      (this.hasExplicitSingleTimeBucket(request) || !this.hasTimeGroupBy(request))
    );
  }
}
