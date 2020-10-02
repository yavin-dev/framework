/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <NaviVisualizationConfig::MetricLabel
 *    @request={{this.request}}
 *    @response={{this.response}}
 *    @options={{this.options}}
 *    @onUpdateConfig={{this.onUpdateConfig}}
 *  />
 */
import { action, set } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { Args as MetricLabelArgs } from '../navi-visualizations/metric-label';
import NaviVisualizationConfigBaseComponent from './base';

type Options = MetricLabelArgs['options'];

export default class NaviVisualizationConfigMetricLabelComponent extends NaviVisualizationConfigBaseComponent<Options> {
  @readOnly('args.request.metricColumns.firstObject') metricColumn!: ColumnFragment;

  /**
   * @param alias - date string input event
   */
  @action
  updateLabel(alias: string) {
    // TODO: use report action
    set(this.args.request.metricColumns[0], 'alias', alias);
  }

  @action
  updateFormat(format: string) {
    this.args.onUpdateConfig?.({ format });
  }
}
