/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action, set } from '@ember/object';
import ColumnFragment from 'navi-core/models/request/column';
import { Args as GoalGaugeArgs } from '../navi-visualizations/goal-gauge';
import NaviVisualizationConfigBaseComponent from 'navi-core/components/navi-visualization-config/base';

type Options = GoalGaugeArgs['options'];

export default class NaviVisualizationConfigGoalGaugeComponent extends NaviVisualizationConfigBaseComponent<Options> {
  get metricColumn(): ColumnFragment {
    return this.args.request.metricColumns[0];
  }

  /**
   * @param alias - date string input event
   */
  @action
  updateLabel(alias: string) {
    // TODO: use report action
    set(this.metricColumn, 'alias', alias);
  }

  @action
  updateBaseline(baselineValue: string) {
    this.args.onUpdateConfig?.({ ...this.args.options, baselineValue: Number(baselineValue) });
  }

  @action
  updateGoal(goalValue: string) {
    this.args.onUpdateConfig?.({ ...this.args.options, goalValue: Number(goalValue) });
  }
}
