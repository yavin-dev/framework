/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexGauge
 *   @model={{this.model}}
 *   @options={{this.goalGaugeOptions}}
 * />
 */
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import numeral from 'numeral';

export default class NaviVisualizationsApexGauge extends Component {
  /**
   * @property {number} - the current value of the metric being displayed
   */
  @computed('model')
  get data() {
    return this.args.model?.firstObject?.response?.rows?.[0]?.[this.args.model.firstObject.request.metrics['0'].metric];
  }

  /**
   * @property {array} - an array containing the progress percentage
   */
  @computed('options', 'data')
  get series() {
    const val =
      100 *
      ((this.data - Number(this.args.options.baselineValue)) /
        (Number(this.args.options.goalValue) - Number(this.args.options.baselineValue)));
    return [val];
  }

  /**
   * @property {string} - the hex color of the gauge
   */
  @computed('series')
  get gaugeColor() {
    const RED = '#f05050';
    const YELLOW = '#ffc831';
    const GREEN = '#44b876';
    if (this.series[0] < 75) {
      return RED;
    } else if (this.series[0] > 85) {
      return GREEN;
    } else {
      return YELLOW;
    }
  }

  /**
   * @property {object} - the ApexCharts options object
   */
  @computed('data', 'gaugeColor')
  get chartOptions() {
    const radialBar = {
      startAngle: -90,
      endAngle: 90,
      hollow: { size: '60%' },
      dataLabels: {
        total: { show: true, label: this._formatNumber(this.data) }
      }
    };
    return {
      plotOptions: { radialBar },
      colors: [this.gaugeColor]
    };
  }

  /**
   * Formats numbers for display
   * @method _formatNumber
   * @private
   * @param {Number} value - value to format
   * @returns {String} formatted number
   */
  _formatNumber(value) {
    let formatStr = value >= 1000000000 ? '0.[000]a' : '0.[00]a';
    return numeral(value)
      .format(formatStr)
      .toUpperCase();
  }
}
