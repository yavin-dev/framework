/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexLine
 *   @model={{this.model}}
 *   @options={{this.metricOptions}}
 * />
 */
import numeral from 'numeral';
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import moment from 'moment';
import { normalize } from '../../chart-builders/apex';

export default class NaviVisualizationsApexPie extends Component {
  /**
   * @property {object} - an ApexCharts-friendly object of the data and data labels
   */
  @computed('model')
  get data() {
    return normalize(this.args.model.firstObject.request, this.args.model.firstObject.response.rows);
  }

  /**
   * @properties {array} - array of objects with ApexCharts-formatted data
   */
  @computed('data')
  get series() {
    return this.data.series;
  }

  /**
   * @properties {array} - array of labels re-formatted to be human readable
   */
  @computed('data')
  get labels() {
    let labels = this.data.labels.map(item => {
      return moment(item, 'YYY-MM-DD T').format('MMM D');
    });
    return labels;
  }

  /**
   * @property {object} - ApexCharts-compatible object of options
   */
  @computed('series', 'labels')
  get chartOptions() {
    return {
      chart: {
        type: 'line'
      },
      series: this.series,
      xaxis: {
        categories: this.labels
      },
      yaxis: {
        type: 'datetime',
        labels: {
          formatter: function(value) {
            return numeral(value).format('0.00a');
          }
        }
      },
      stroke: {
        curve: 'straight'
      }
    };
  }
}
