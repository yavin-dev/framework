/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import LineChart from './line-chart';

export default class BarChart extends LineChart {
  chartType = 'bar';

  /**
   * @property {Array} classNames - since bar-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  classNames = ['bar-chart-widget', 'line-chart-widget'];

  /**
   * @override
   * @property {String} c3ChartType - c3 chart type
   */
  get c3ChartType() {
    return this.chartType;
  }
}
