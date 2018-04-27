import Ember from 'ember';

const { A:arr, computed, get, set, setProperties } = Ember;

export default Ember.Controller.extend({
  request: {
    dimensions: [
      { dimension: { name: 'os', longName: 'Operating System' } }
    ]
  },

  visualization: computed('options', function() {
    return {
      type: 'table',
      version: 1,
      metadata: get(this, 'options')
    };
  }),

  //options passed through to the table component
  options: {
    columns: [
      {
        field: 'dateTime',
        type: 'dateTime',
        displayName: 'Date'
      },
      {
        field: 'os',
        type: 'dimension',
        displayName: 'Operating System'
      },
      {
        field: 'uniqueIdentifier',
        type: 'metric',
        displayName: 'Unique Identifiers'
      },
      {
        field: 'totalPageViews',
        type: 'metric',
        displayName: 'Total Page Views'
      },
      {
        field: 'totalPageViewsWoW',
        type: 'threshold',
        displayName: 'Total Page Views WoW'
      }
    ]
  },

  upsertSort(options) {
    let request = arr(get(this, 'model.firstObject.request'));
    setProperties(request, {
      sort: [{
        metric: options.metric,
        direction: options.direction
      }]
    });
  },

  removeSort() {
    let request = arr(get(this, 'model.firstObject.request'));
    setProperties(request, { sort: [] });
  },

  updateColumnOrder(newColumnOrder) {
    set(this, 'options.columns', newColumnOrder);
  },

  actions: {
    onToggleEditing(editing) {
      this.send('onUpdateConfig', { editing });
    },

    onUpdateReport(actionType, options) {
      this[actionType](options);
    },

    onUpdateConfig(configUpdate) {
      set(this, 'options',
        $.extend(true, {}, get(this, 'options'), configUpdate));
    }
  }
});
