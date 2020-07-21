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

export default class NaviVisualizationsApexPie extends Component {
  /**
   * @property {object} - an ApexCharts-friendly object of the data and data labels
   */
  @computed('model')
  get data() {
    // build the series objects and fill in metric names
    let vals = this.args.model.firstObject.request.metrics.map(item => {
      return { name: item, type: 'line', data: [] };
    });
    // fill in the data for each of the metric names
    let timeLabels = this.args.model.firstObject.response.rows.map(item => {
      vals.forEach(element => {
        let num = item[element.name];
        if (num === undefined) {
          num = null;
        }
        element.data.push(num);
      });
      return item.dateTime;
    });
    return { vals: vals, labels: timeLabels };
  }

  /**
   * @properties {array} - array of objects with ApexCharts-formatted data
   */
  @computed('data')
  get series() {
    return this.data.vals;
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
