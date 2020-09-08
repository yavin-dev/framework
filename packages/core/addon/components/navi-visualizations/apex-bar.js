/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexBar
 *   @model={{this.model}}
 *   @options={{this.metricOptions}}
 * />
 */
import NaviVisualizationsApexLine from './apex-line';

export default class NaviVisualizationsApexBar extends NaviVisualizationsApexLine {
  /**
   * @properties {array} - array of objects with ApexCharts-formatted data
   */
  get series() {
    return this.data.series.map(seri => {
      return { type: 'column', name: seri.name, data: seri.data };
    });
  }
}
