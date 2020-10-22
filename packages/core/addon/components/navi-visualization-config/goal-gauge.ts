/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{navi-visualization-config/goal-gauge
 *    request=request
 *    response=response
 *    options=options
 *  }}
 */
import { action, set } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import RequestFragment from 'dummy/models/bard-request-v2/request';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { Args as GoalGaugeArgs } from '../navi-visualizations/goal-gauge';
import NaviVisualizationConfigBaseComponent from './base';

type Options = GoalGaugeArgs['options'];

export default class NaviVisualizationConfigGoalGaugeComponent extends NaviVisualizationConfigBaseComponent<Options> {
  @readOnly('args.request.metricColumns.firstObject') metricColumn!: ColumnFragment;
  @readOnly('args.request') request!: RequestFragment;

  /**
   * @param alias - date string input event
   */
  @action
  updateLabel(alias: string) {
    // TODO: use report action
    debugger;
    set(this.args.request.metricColumns[0], 'alias', alias);
    debugger;
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
