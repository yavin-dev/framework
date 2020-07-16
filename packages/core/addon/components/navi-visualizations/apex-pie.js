import numeral from 'numeral';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../templates/components/navi-visualizations/apex-line';
//import moment from 'moment';

const DEBUG = false;

export default class NaviVisualizationsApexPie extends Component {
  layout = layout;

  @computed('model')
  get data() {
    if (DEBUG) {
      console.log('inside get data');
    }
    // build the series objects and fill in metric names
    let vals = this.model.firstObject.request.metrics.map(item => {
      return { name: item, type: 'line', data: [] };
    });
    // fill in the data for each of the metric names
    let timeLabels = this.model.firstObject.response.rows.map(item => {
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

  @computed('data')
  get series() {
    if (DEBUG) {
      console.log('inside get series');
    }
    return this.data.vals;
  }

  @computed('data')
  get labels() {
    if (DEBUG) {
      console.log('inside get labels');
    }
    let labels = this.data.labels.reduce(function(acc, elem) {
      const longDate = new Date(elem.split(' ')[0]);
      acc.push(longDate.toLocaleString('default', { month: 'short', day: 'numeric' }));
      return acc;
    }, []);
    return labels;
  }

  @computed('series', 'labels')
  get chartOptions() {
    if (DEBUG) {
      console.log('inside apex-line get chartOptions');
    }
    let options = {
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
      }
    };
    return options;
  }
}
