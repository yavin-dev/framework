/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexPie
 *   @model={{this.model}}
 *   @options={{this.visualizationOptions}}
 * />
 */
import Component from '@glimmer/component';
import { normalize } from '../../chart-builders/apex';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NaviVisualizationsApexPie extends Component {
  /**
   * @property {object} - ApexCharts-compatible object of options
   */
  @tracked chartOptions;

  @action
  updateChartOptions() {
    const {
      request,
      response: { rows }
    } = this.args.model.firstObject;
    const data = normalize(request, rows);
    this.chartOptions = {
      chart: {
        type: 'pie',
        height: '100%'
      },
      colors: this.args.options?.series?.config?.colors,
      labels: data.labels,
      legend: {
        position: 'bottom',
        floating: false
      },
      series: data.series[0].data
    };
  }

  constructor(owner, args) {
    super(owner, args);
    this.updateChartOptions();
  }
}
