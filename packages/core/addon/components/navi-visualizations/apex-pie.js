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
   * @property {string} - the metric being displayed
   */
  @computed('args.options')
  get metric() {
    return this.args.options.metadata.series.config.metric.metric;
  }

  /**
   * @property {object} - an ApexCharts-friendly object of the data and data labels
   */
  @computed('args.model')
  get data() {
    return shapeData(this.args.model.firstObject.request, this.args.model.firstObject.response.rows);
  }

  /**
   * @property {object} - ApexCharts-compatible object of options
   */
  @computed('data', 'metric')
  get chartOptions() {
    return {
      chart: { type: 'pie' },
      series: this.data.series.find(dataSet => dataSet.name === this.metric).data,
      labels: this.data.labels
    };
  }
}
