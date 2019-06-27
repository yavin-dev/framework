/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/bar-chart
 *   model=model
 *   options=options
 * }}
 */

import LineChart from './line-chart';

//TODO add a base class for charts
export default LineChart.extend({
  chartType: 'bar',

  /**
   * @property {Array} classNames - since bar-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  classNames: ['bar-chart-widget'],

  /**
   * Chooses c3 chart type
   *
   * @override
   */
  _c3ChartType() {
    return this.chartType;
  }
});
