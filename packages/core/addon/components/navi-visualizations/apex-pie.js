/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexPie
 *   @model={{this.model}}
 *   @options={{this.visualizationOptions}}
 * />
 */
import Component from '@glimmer/component';
import { shapeData } from '../../chart-builders/apex';

export default class NaviVisualizationsApexPie extends Component {
  /**
   * @property {object} - an ApexCharts-friendly object of the data and data labels
   */
  get data() {
    const {
      request,
      response: { rows }
    } = this.args.model.firstObject;
    return shapeData(request, rows);
  }

  /**
   * @property {object} - ApexCharts-compatible object of options
   */
  get chartOptions() {
    return {
      chart: {
        type: 'pie',
        height: '100%'
      },
      colors: this.args.options?.series?.config?.colors,
      labels: this.data.labels,
      legend: {
        position: 'bottom',
        floating: false
      },
      series: this.data.series[0].data
    };
  }
}
