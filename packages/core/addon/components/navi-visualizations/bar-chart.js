/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/bar-chart
 *   model=model
 *   options=options
 * }}
 */

import LineChart from './line-chart';
import { computed } from '@ember/object';

//TODO add a base class for charts
export default class BarChart extends LineChart {
  chartType = 'bar';

  /**
   * @property {Array} classNames - since bar-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  classNames = ['bar-chart-widget'];

  /**
   * @override
   * @property {String} c3ChartType - c3 chart type
   */
  @computed('chartType')
  get c3ChartType() {
    return this.chartType;
  }
}
