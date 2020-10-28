/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action, set } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { Args as GoalGaugeArgs } from '../navi-visualizations/goal-gauge';
import NaviVisualizationConfigBaseComponent from './base';

type Options = GoalGaugeArgs['options'];

export default class NaviVisualizationConfigGoalGaugeComponent extends NaviVisualizationConfigBaseComponent<Options> {
  @readOnly('args.request.metricColumns.firstObject') metricColumn!: ColumnFragment;

  /**
   * @param alias - date string input event
   */
  @action
  updateLabel(alias: string) {
    // TODO: use report action
    set(this.metricColumn, 'alias', alias);
  }

  @action
  updateBaseline(baselineValue: number) {
    this.args.onUpdateConfig?.({ baselineValue });
  }

  @action
  updateGoal(goalValue: number) {
    this.args.onUpdateConfig?.({ goalValue });
  }
}
