import Component from '@ember/component';
import { computed } from '@ember/object';
import numeral from 'numeral';
import layout from '../../templates/components/navi-visualizations/apex-gauge';

export default class NaviVisualizationsApexGauge extends Component {
  layout = layout;

  /**
   * @property {number} - the current value of the metric being displayed
   */
  @computed('model')
  get data() {
    const metric = this.model.firstObject.request.metrics['0'].metric;
    return this.model?.firstObject?.response?.rows?.[0]?.[metric];
  }

  /**
   * @property {array} - an array containing the progress percentage
   */
  @computed('options', 'data')
  get series() {
    const val =
      100 *
      ((this.data - Number(this.options.baselineValue)) /
        (Number(this.options.goalValue) - Number(this.options.baselineValue)));
    return [val];
  }

  /**
   * @property {string} - the hex color of the gauge
   */
  @computed('series')
  get gaugeColor() {
    // thresholds:
    // red < 75 <= yellow <= 85 < green
    if (this.series[0] < 75) {
      return '#f05050';
    } else if (this.series[0] > 85) {
      return '#44b876';
    } else {
      return '#ffc831';
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
