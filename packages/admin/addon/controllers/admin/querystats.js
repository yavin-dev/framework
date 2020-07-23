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

export default class TableController extends Controller {
  request = {
    dimensions: [{ dimension: { id: 'os', name: 'Operating System' } }]
  };

  @computed('options')
  get visualization() {
    return {
      type: 'table',
      version: 1,
      metadata: get(this, 'options')
    };
  }

  //options passed through to the table component
  options = {
    columns: [
      {
        attributes: { name: 'dateTime' },
        type: 'dateTime',
        displayName: 'Date'
      },
      {
        attributes: { name: 'os' },
        type: 'dimension',
        displayName: 'Operating System'
      },
      {
        attributes: { name: 'uniqueIdentifier', parameters: {} },
        type: 'metric',
        displayName: 'Unique Identifiers'
      },
      {
        attributes: { name: 'totalPageViews', parameters: {} },
        type: 'metric',
        displayName: 'Total Page Views'
      },
      {
        attributes: {
          name: 'totalPageViewsWoW',
          parameters: {},
          canAggregateSubtotal: false
        },
        type: 'metric',
        displayName: 'Total Page Views WoW'
      }
    ],
    showTotals: {
      grandTotal: true,
      subtotal: true
    }
  };

  upsertSort(options) {
    let request = arr(get(this, 'model.firstObject.request'));
    setProperties(request, {
      sort: [
        {
          metric: options.metric,
          direction: options.direction
        }
      ]
    });
  }

  removeSort() {
    let request = arr(get(this, 'model.firstObject.request'));
    setProperties(request, { sort: [] });
  }

  updateColumn(column) {
    const newColumns = get(this, 'options.columns').map(col => {
      let propsToOmit = ['format'];

      if (isEqual(omit(col.attributes, propsToOmit), omit(column.attributes, propsToOmit))) {
        return column;
      }

      return col;
    });
    set(this, 'options.columns', newColumns);
  }

  updateColumnOrder(newColumnOrder) {
    set(this, 'options.columns', newColumnOrder);
  }

  @action
  onUpdateReport(actionType, options) {
    this[actionType](options);
  }

  @action
  onUpdateConfig(configUpdate) {
    set(this, 'options', merge({}, get(this, 'options'), configUpdate));
  }
}
