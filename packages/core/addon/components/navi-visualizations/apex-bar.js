/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexBar
 *   @model={{this.model}}
 *   @options={{this.metricOptions}}
 * />
 */
import NaviVisualizationsApexPie from './apex-line';
import { computed } from '@ember/object';

export default class NaviVisualizationsApexBar extends NaviVisualizationsApexPie {
  /**
   * @properties {array} - array of objects with ApexCharts-formatted data
   */
  @computed('data')
  get series() {
    this.data.vals.forEach(series => {
      series.type = 'column';
    });
    return this.data.vals;
  }
}
