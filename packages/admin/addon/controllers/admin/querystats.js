// import Ember from 'ember';

// export default Ember.Controller.extend({
//   userColumns: Ember.A([
//     {
//       'key': 'id',
//       'displayName': 'ID'
//     },
//     {
//       'key': 'apiVersion',
//       'displayName': 'API Version'
//     },
//     {
//       'key': 'apiQuery',
//       'displayName': 'API Query'
//     },
//     {
//       'key': 'storeQuery',
//       'displayName': 'SQL Query'
//     },
//     {
//       'key': 'modelName',
//       'displayName' : 'Model Name'
//     },
//     {
//       'key': 'user',
//       'displayName' : 'User'
//     },
//     {
//       'key': 'duration',
//       'displayName': 'Execution Time'
//     },
//     {
//       'key': 'rowsReturned',
//       'displayName': 'Result Size'
//     },
//     {
//       'key': 'bytesReturned',
//       'displayName': 'Result Length'
//     },
//     {
//       'key': 'creaedOn',
//       'displayName': 'Created On'
//     },
//     {
//       'key': 'fromUI',
//       'displayName' : 'From UI'
//     },
//     {
//       'key': 'status',
//       'displayName' : 'Status'
//     },
//     {
//       'key': 'hostName',
//       'displayName': 'Host Name'
//     }
//   ])
// });
import Controller from '@ember/controller';
import { A as arr } from '@ember/array';
import { setProperties, set, get, computed, action } from '@ember/object';
import { isEqual, merge, omit } from 'lodash-es';
import { hash } from 'rsvp';
import Ember from 'ember';
import { tracked } from '@glimmer/tracking';

//do data manipulation here
function getAverageQueryCount(promiseArray) {
  let return_value_accepted = [0, 0, 0, 0, 0, 0, 0, 0];
  let return_value_failed = [0, 0, 0, 0, 0, 0, 0, 0];
  let return_value_completed = [0, 0, 0, 0, 0, 0, 0, 0];
  let return_value_cancelled = [0, 0, 0, 0, 0, 0, 0, 0];
  let return_value_inprogress = [0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < promiseArray._objects.length; i++) {
    let createdOn = promiseArray._objects[i]['createdOn'];
    let type_ = promiseArray._objects[i]['status'];
    let time = createdOn.split(' ')[1];
    let hour = Number(time.substring(0, 2));
    if (type_ === 'ACCEPTED') {
      if (hour < 3) {
        return_value_accepted[0] += 1;
      } else if (hour >= 3 && hour < 6) {
        return_value_accepted[1] += 1;
      } else if (hour >= 6 && hour < 9) {
        return_value_accepted[2] += 1;
      } else if (hour >= 9 && hour < 12) {
        return_value_accepted[3] += 1;
      } else if (hour >= 12 && hour < 15) {
        return_value_accepted[4] += 1;
      } else if (hour >= 15 && hour < 18) {
        return_value_accepted[5] += 1;
      } else if (hour >= 18 && hour < 21) {
        return_value_accepted[6] += 1;
      } else if (hour >= 21) {
        return_value_accepted[7] += 1;
      }
    } else if (type_ === 'COMPLETED') {
      if (hour < 3) {
        return_value_completed[0] += 1;
      } else if (hour >= 3 && hour < 6) {
        return_value_completed[1] += 1;
      } else if (hour >= 6 && hour < 9) {
        return_value_completed[2] += 1;
      } else if (hour >= 9 && hour < 12) {
        return_value_completed[3] += 1;
      } else if (hour >= 12 && hour < 15) {
        return_value_completed[4] += 1;
      } else if (hour >= 15 && hour < 18) {
        return_value_completed[5] += 1;
      } else if (hour >= 18 && hour < 21) {
        return_value_completed[6] += 1;
      } else if (hour >= 21) {
        return_value_completed[7] += 1;
      }
    } else if (type_ === 'CANCELLED') {
      if (hour < 3) {
        return_value_cancelled[0] += 1;
      } else if (hour >= 3 && hour < 6) {
        return_value_cancelled[1] += 1;
      } else if (hour >= 6 && hour < 9) {
        return_value_cancelled[2] += 1;
      } else if (hour >= 9 && hour < 12) {
        return_value_cancelled[3] += 1;
      } else if (hour >= 12 && hour < 15) {
        return_value_cancelled[4] += 1;
      } else if (hour >= 15 && hour < 18) {
        return_value_cancelled[5] += 1;
      } else if (hour >= 18 && hour < 21) {
        return_value_cancelled[6] += 1;
      } else if (hour >= 21) {
        return_value_cancelled[7] += 1;
      }
    } else if (type_ === 'FAILED') {
      if (hour < 3) {
        return_value_failed[0] += 1;
      } else if (hour >= 3 && hour < 6) {
        return_value_failed[1] += 1;
      } else if (hour >= 6 && hour < 9) {
        return_value_failed[2] += 1;
      } else if (hour >= 9 && hour < 12) {
        return_value_failed[3] += 1;
      } else if (hour >= 12 && hour < 15) {
        return_value_failed[4] += 1;
      } else if (hour >= 15 && hour < 18) {
        return_value_failed[5] += 1;
      } else if (hour >= 18 && hour < 21) {
        return_value_failed[6] += 1;
      } else if (hour >= 21) {
        return_value_failed[7] += 1;
      }
    } else if (type_ === 'INPROGRESS') {
      if (hour < 3) {
        return_value_inprogress[0] += 1;
      } else if (hour >= 3 && hour < 6) {
        return_value_inprogress[1] += 1;
      } else if (hour >= 6 && hour < 9) {
        return_value_inprogress[2] += 1;
      } else if (hour >= 9 && hour < 12) {
        return_value_inprogress[3] += 1;
      } else if (hour >= 12 && hour < 15) {
        return_value_inprogress[4] += 1;
      } else if (hour >= 15 && hour < 18) {
        return_value_inprogress[5] += 1;
      } else if (hour >= 18 && hour < 21) {
        return_value_inprogress[6] += 1;
      } else if (hour >= 21) {
        return_value_inprogress[7] += 1;
      }
    }
  }
  let return_value = [];
  return_value.push(return_value_accepted);
  return_value.push(return_value_completed);
  return_value.push(return_value_cancelled);
  return_value.push(return_value_failed);
  return_value.push(return_value_inprogress);
  return return_value;
}

function getTotalQueries(promiseArray) {
  let return_value = [0, 0, 0, 0, 0];
  for (let i = 0; i < promiseArray._objects.length; i++) {
    let obj = promiseArray._objects[i];
    let queryVal = obj['status'];
    if (queryVal === 'ACCEPTED') {
      return_value[0] += 1;
    } else if (queryVal === 'COMPLETED') {
      return_value[1] += 1;
    } else if (queryVal === 'CANCELLED') {
      return_value[2] += 1;
    } else if (queryVal === 'FAILED') {
      return_value[3] += 1;
    } else if (queryVal === 'INPROGRESS') {
      return_value[4] += 1;
    }
  }
  return return_value;
}

function getAverageValueAndAxis(promiseArray) {
  //console.log(promiseArray._objects);
  var hash_map = {};
  let return_value = {};
  let averageValue = [];
  let columnNames = [];
  for (let i = 0; i < promiseArray._objects.length; i++) {
    let obj = promiseArray._objects[i];
    if (obj['nameModel'] in hash_map) {
      let total_length = hash_map[obj['nameModel']]['length'];
      let new_value = hash_map[obj['nameModel']]['value'] * total_length + obj['duration'];
      hash_map[obj['nameModel']]['length'] = ++total_length;
      hash_map[obj['nameModel']]['value'] = new_value / total_length;
    } else {
      var obj2 = {};
      obj2['length'] = 1;
      obj2['value'] = obj['duration'];
      hash_map[obj['nameModel']] = obj2;
    }
  }
  for (const key_ in hash_map) {
    //console.log(key_);
    averageValue.push(hash_map[key_]['value'].toFixed(2));
    columnNames.push(key_);
  }
  return_value['values'] = averageValue;
  return_value['column_names'] = columnNames;
  return return_value;
  //return [30,40,35,50,49,60,70,91,125];
}
export default class AdminQuerystatsController extends Controller {
  //promiseArray = this.get('model');
  data_persistent = {};
  type = 'bar';
  width = '1000px';
  height = '500px';
  series = [
    {
      name: 'Average Query Duration',
      data: []
    }
  ];
  barOptions = {
    chart: {
      toolbar: {
        show: true
      }
    },
    title: {
      text: 'Average QueryDuration Time per Model',
      align: 'center'
    },
    xaxis: {
      type: 'category',
      categories: ['Author', 'Publisher', 'Book'] //maybe have to call her
    }
  };

  @action
  mountedHandler() {
    this.barOptions['xaxis']['categories'] = this.data_persistent['column_names'];
  }

  @action
  clickHandler() {
    console.log('Click handler triggered');
  }

  @action
  beforeMountHandler() {
    //console.log('Before Mount handler triggered');
    Ember.run(() => {
      let data_ = getAverageValueAndAxis(this.model.promiseArray);
      this.data_persistent = data_;
      this.barOptions['xaxis']['categories'] = data_['column_names'];
      this.series[0]['data'] = data_['values'];
    });
  }

  //donut
  has_been_rendered = false;
  type_2 = 'donut';
  width_2 = '1000px';
  height_2 = '500px';
  @tracked
  series_2 = [];
  donutOptions = {
    chart: {
      type: 'donut'
    },
    title: {
      text: 'Query Status',
      align: 'center',
      offsetX: -63
    },
    labels: ['ACCEPTED', 'COMPLETED', 'CANCELLED', 'FAILED', 'INPROGRESS'], //maybe have to call her
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total Queries'
            }
          }
        }
      }
    }
  };

  @action
  beforeMountHandlerPie() {
    if (!this.has_been_rendered) {
      console.log('Before Mount handler triggered');
      this.has_been_rendered = true;
      let data_ = getTotalQueries(this.model.promiseArray);
      this.series_2 = data_;
    }
  }

  //time series
  chartOptions = {
    chart: {
      height: '600px',
      width: '1200px',
      type: 'area',
      stacked: true
    },
    title: {
      text: 'Total Active Query Count',
      align: 'center'
    },
    series: [
      {
        name: 'ACCEPTED',
        data: []
      },
      {
        name: 'COMPLETED',
        data: []
      },
      {
        name: 'CANCELLED',
        data: []
      },
      {
        name: 'FAILED',
        data: []
      },
      {
        name: 'INPROGRESS',
        data: []
      }
    ],
    xaxis: {
      type: 'category',
      categories: ['3:00 AM', '6:00 AM', '9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM', '12:00 AM']
    },
    yaxis: {
      min: 0
    },
    stroke: {
      curve: 'smooth'
    }
  };

  @action
  beforeMountHandlerTime() {
    //console.log('Before Mount handler triggered');
    let data_ = getAverageQueryCount(this.model.promiseArray);
    //this.data_persistent = data_;
    //this.barOptions['xaxis']['categories'] = data_['column_names'];
    let i = 0;
    let blah_ = this.chartOptions['series'];
    this.chartOptions['series'].forEach(item => {
      item['data'] = data_[i++];
    });
  }
}
