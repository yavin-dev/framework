import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from '../../templates/components/navi-visualizations/apex-pie';
import { alias } from '@ember/object/computed';
export default class NaviVisualizationsApexPie extends Component {
  layout = layout;
  @service() bardMetadata;

  @alias('options.metadata.series.config.metric.metric') metric;

  /**
   * @property {string} - the name of the fields that are going to be displayed
   */
  @computed('options')
  get descript() {
    let val = this.bardMetadata.getById(
      'dimension',
      this.options.metadata.series.config.dimensionOrder[0],
      this.model.firstObject.request.dataSource
    );
    val = val.id + '|' + val.descriptionTag;
    return val;
  }

  /**
   * @property {object} - an ApexCharts-friendly object of the data and data labels
   */
  @computed('model')
  get data() {
    let vals = { series: [], labels: [] };
    const location = this.model.firstObject.response.rows;
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
    let pie = {
      chart: { type: 'pie' },
      series: this.data.series,
      labels: this.data.labels
    };
    return pie;
  }
}
