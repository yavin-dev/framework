/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * <NaviVisualizationConfig::LineChart
 *    @request={{this.request}}
 *    @response={{this.response}}
 *    @options={{this.chartOptions}}
 *    @type={{this.visualizationType}}
 *    @onUpdateConfig={{this.onUpdateChartConfig}}
 * />
 */

import Component from '@glimmer/component';
import { set, computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import { SeriesConfig, SeriesType } from 'navi-core/models/line-chart';
import { Args as BaseArgs } from './base';
import { Args as LineChartArgs } from '../navi-visualizations/line-chart';

type Style = LineChartArgs['options']['style'];

type Options = LineChartArgs['options'];
type Args = BaseArgs<Options> & {
  type: unknown;
};
export default class NaviVisualizationConfigLineChartComponent extends Component<Args> {
  curveOptions = <const>['line', 'spline', 'step'];

  /**
   * prefix for the line chart component
   */
  typePrefix = 'navi-visualization-config/chart-type/';

  /**
   * whether to display the `stacked` toggle
   */
  @computed('args.{request,type}')
  get showStackOption() {
    const { type, request } = this.args;
    const visualizationManifest = getOwner(this).lookup(`navi-visualization-manifest:${type}`);

    return visualizationManifest.hasGroupBy(request) || visualizationManifest.hasMultipleMetrics(request);
  }

  @readOnly('args.options.axis.y.series.config') seriesConfig!: SeriesConfig;

  @readOnly('args.options.axis.y.series.type') seriesType!: SeriesType;

  /**
   * Replace the seriesConfig in visualization config object.
   *
   * @param seriesConfig
   */
  @action
  onUpdateSeriesConfig(seriesConfig: SeriesConfig) {
    const newOptions = { ...this.args.options };
    set(newOptions.axis.y.series, 'config', seriesConfig);
    this.args.onUpdateConfig(newOptions);
  }

  /**
   * Updates line chart style
   *
   * @param field - which setting is getting updated, currently `curve` and `area`
   * @param value - value to update the setting with.
   */
  @action
  onUpdateStyle<StyleOption extends keyof Style>(field: StyleOption, value: Style[StyleOption]) {
    let newOptions = { style: {}, ...this.args.options };
    set(newOptions.style, field, value);
    this.args.onUpdateConfig(newOptions);
  }
}
