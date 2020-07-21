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
import { inject as service } from '@ember/service';

export default class NaviVisualizationsApexPie extends Component {
  @service() bardMetadata;

  /**
   * @property {string} - the metric being displayed
   */
  @computed('options')
  get metric() {
    return this.args.options.metadata.series.config.metric.metric;
  }

  /**
   * @property {string} - the category that differentiates the pie slices
   */
  @computed('options')
  get descript() {
    let val = this.bardMetadata.getById(
      'dimension',
      this.args.options.metadata.series.config.dimensionOrder[0],
      this.args.model.firstObject.request.dataSource
    );
    val = val.id + '|' + val.descriptionTag;
    return val;
  }

  /**
   * @property {object} - an ApexCharts-friendly object of the data and data labels
   */
  @computed('model')
  get data() {
    const vals = { series: [], labels: [] };
    const location = this.args.model.firstObject.response.rows;
    for (let row = 0; row < location.length; row++) {
      vals.series.push(location[row][this.metric]);
      vals.labels.push(location[row][this.descript]);
    }
    return vals;
  }

  /**
   * @property {object} - ApexCharts-compatible object of options
   */
  @computed('series', 'labels')
  get chartOptions() {
    return {
      chart: { type: 'pie' },
      series: this.data.series,
      labels: this.data.labels
    };
  }
}
