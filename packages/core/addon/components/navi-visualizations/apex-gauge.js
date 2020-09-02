/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexGauge
 *   @model={{this.model}}
 *   @options={{this.goalGaugeOptions}}
 * />
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import numeral from 'numeral';
import { fetchColor } from 'navi-core/utils/enums/denali-colors';
import { normalize } from '../../chart-builders/apex';

export default class NaviVisualizationsApexGauge extends Component {
  /**
   * @property {number} - the current value of the metric being displayed
   */
  get data() {
    const {
      request,
      response: { rows }
    } = this.args.model.firstObject;
    return normalize(request, rows).series[0];
  }

  /**
   * @property {number} - the progress percentage
   */
  get percent() {
    const goalValue = Number(this.args.options?.series?.config?.goalValue);
    const baselineValue = Number(this.args.options?.series?.config?.baselineValue);
    if (goalValue === undefined || baselineValue === undefined) {
      return 0;
    }
    return 100 * ((this.data.data - baselineValue) / (goalValue - baselineValue));
  }

  /**
   * @property {string} - the hex color of the gauge
   */
  get gaugeColor() {
    if (this.percent < 75) {
      return fetchColor(0, 'status');
    } else if (this.percent > 85) {
      return fetchColor(2, 'status');
    } else {
      return fetchColor(1, 'status');
    }
  }

  /**
   * @property {string} constrainBy - the graph dimension to be pinned according to the orientation of the visualization container
   */
  @tracked constrainBy = 'height';

  /**
   * updates constrainBy when the visualization container's dimensions change, if necessary
   * @method updateDimensions
   */
  @action
  updateDimensions() {
    if (this.args.containerComponent.$('* [class*=visualization-container]') === undefined) {
      return;
    }
    const width = this.args.containerComponent.$('* [class*=visualization-container]').width();
    const height = this.args.containerComponent.$('* [class*=visualization-container]').height();
    // if oriented portrait-style, should constrain to width
    if (height > width && !(this.constrainBy === 'width')) {
      this.constrainBy = 'width';
    }
    // if oriented landscape-style, should constrain to height
    else if (width > height && !(this.constrainBy === 'height')) {
      this.constrainBy = 'height';
    }
  }

  /**
   * @property {object} - the ApexCharts options object
   */
  get chartOptions() {
    const options = {
      chart: {
        type: 'radialBar',
        [this.constrainBy]: '100%'
      },
      series: [this.percent],
      labels: [this._formatNumber(this.data.data)],
      colors: [this.gaugeColor],
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: { size: '70%' },
          dataLabels: {
            name: {
              color: [],
              fontSize: 40
            },
            value: {
              show: true,
              formatter: value => this.args.options?.series?.config?.metrics[0].name,
              fontSize: 20
            }
          }
        }
      }
    };
    return options;
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

  constructor(owner, args) {
    super(owner, args);
    this.updateDimensions();
    const observer = new ResizeObserver(entries => {
      this.updateDimensions();
    });
    observer.observe(this.args.containerComponent.element);
    let container = $(this.args.containerComponent.element);
    if (container.length) {
      container.on('resizestop', () => {
        this.updateDimensions();
      });
    }
  }
}
