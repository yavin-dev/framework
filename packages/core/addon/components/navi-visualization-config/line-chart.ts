/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { cloneDeep } from 'lodash-es';
import type { Args as BaseArgs } from './base';
import type { Args as LineChartArgs } from '../navi-visualizations/line-chart';
import type { SeriesConfig, SeriesType } from 'navi-core/chart-builders/base';
import type NaviVisualizationBaseManifest from 'navi-core/navi-visualization-manifests/base';

type Style = LineChartArgs['options']['style'];

type Options = LineChartArgs['options'];
type Args = BaseArgs<Options> & {
  type: unknown;
};
export default class NaviVisualizationConfigLineChartComponent extends Component<Args> {
  curveOptions = <const>['line', 'spline', 'step'];

  /**
   * whether to display the `stacked` toggle
   */
  get showStackOption() {
    const { request, type } = this.args;
    const manifest = getOwner(this).lookup(`navi-visualization-manifest:${type}`) as NaviVisualizationBaseManifest;

    return manifest.hasGroupBy(request) || manifest.hasMultipleMetrics(request);
  }

  get seriesConfig(): SeriesConfig {
    return this.args.options?.axis?.y?.series?.config;
  }

  get seriesType(): SeriesType {
    return this.args.options?.axis?.y?.series?.type;
  }

  /**
   * Replace the seriesConfig in visualization config object.
   *
   * @param seriesConfig
   */
  @action
  onUpdateSeriesConfig(seriesConfig: SeriesConfig) {
    const newOptions = cloneDeep(this.args.options);
    newOptions.axis.y.series.config = seriesConfig;
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
    let newOptions = cloneDeep({ style: {}, ...this.args.options });
    newOptions.style[field] = value;
    this.args.onUpdateConfig(newOptions);
  }
}
