/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexPie
 *   @model={{this.model}}
 *   @options={{this.visualizationOptions}}
 * />
 */
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { shapeData } from '../../chart-builders/apex';

export default class NaviVisualizationsApexPie extends Component {
  /**
   * @property {object} - an ApexCharts-friendly object of the data and data labels
   */
  @computed('args.model.firstObject')
  get data() {
    return shapeData(this.args.model.firstObject.request, this.args.model.firstObject.response.rows);
  }

  /**
   * @property {object} - ApexCharts-compatible object of options
   */
  @computed('data', 'args.options')
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
