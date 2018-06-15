import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

const { get } = Ember;

let Store;

moduleForModel('dashboard-widget', 'Unit | Model | dashboard widget', {
  needs: [
    'model:report',
    'model:user',
    'model:dashboard',
    'model:delivery-rule',
    'model:fragments/presentation',
    'adapter:bard-metadata',
    'adapter:dimensions/bard',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'model:visualization',
    'model:goal-gauge',
    'model:line-chart',
    'model:table',
    'validator:number',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'validator:request-metric-exist',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-dimension-order',
    'service:bard-metadata',
    'serializer:bard-request/request',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'serializer:bard-request/fragments/metric',
    'serializer:visualization',
    'serializer:goal-gauge',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:user',
    'service:bard-dimensions',
    'serializer:dashboard-widget',
    'serializer:dashboard',
    'adapter:dashboard-widget',
    'adapter:dashboard',
    'transform:moment',
    'transform:fragment',
    'config:environment'
  ],
  beforeEach() {
    setupMock();
    Store = this.store();

    Store.createRecord('user', { id: 'navi_user' });

    // Load metadata needed for request fragment
    let metadataService = this.container.lookup('service:bard-metadata');
    metadataService.loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('tempId', function(assert) {
  assert.expect(3);

  return Ember.run(() => {
    return Store.findRecord('dashboard', 1).then(dashboard => {
      let widget = Store.createRecord('dashboard-widget', {
        dashboard
      });

      assert.ok(!!get(widget, 'tempId'), '`tempId` exists when `id` does not');

      assert.equal(
        get(widget, 'tempId'),
        get(widget, 'tempId'),
        '`tempId` is always the same value'
      );

      return widget.save().then(() => {
        assert.notOk(
          !!get(widget, 'tempId'),
          '`tempId` is null when `id` exists'
        );
      });
    });
  });
});

test('Retrieving Records', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('dashboard', 1).then(dashboard => {
      return dashboard.get('widgets').then(widgets => {
        let rec = widgets.objectAt(0);

        assert.deepEqual(
          rec.toJSON(),
          {
            title: 'Mobile DAU Goal',
            dashboard: '1',
            visualization: {
              type: 'goal-gauge',
              version: 1,
              metadata: {
                baselineValue: 200,
                goalValue: 1000,
                metric: { metric: 'adClicks', parameters: {} }
              }
            },
            requests: [
              {
                logicalTable: {
                  table: 'network',
                  timeGrain: 'day'
                },
                metrics: [{ metric: 'adClicks' }, { metric: 'navClicks' }],
                dimensions: [],
                filters: [],
                having: [],
                intervals: [
                  {
                    end: 'current',
                    start: 'P1D'
                  }
                ],
                bardVersion: 'v1',
                requestVersion: 'v1',
                sort: []
              }
            ],
            createdOn: '2016-01-01 00:00:00.000',
            updatedOn: '2016-01-01 00:00:00.000'
          },
          'dashboard-widget record with id 1 is found in the store'
        );
      });
    });
  });
});

test('Request property', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('dashboard', 1).then(dashboard => {
      return dashboard.get('widgets').then(widgets => {
        let widget = widgets.objectAt(0);

        assert.equal(
          widget.get('request'),
          widget.get('requests.firstObject'),
          'Widget has a `request` property that is the same as the first request'
        );
      });
    });
  });
});

test('Cloning Dashboard Widgets', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('dashboard', 1).then(dashboard => {
      return dashboard.get('widgets').then(widgets => {
        let widgetModel = widgets.objectAt(0),
          clonedModel = widgetModel.clone().toJSON(),
          expectedModel = widgetModel.toJSON();

        // setting attributes to null, which are not necessary to check in clone object
        expectedModel.createdOn = null;
        expectedModel.updatedOn = null;
        expectedModel.dashboard = null;

        assert.deepEqual(
          clonedModel,
          expectedModel,
          'The cloned widget model has the same attrs as original model'
        );
      });
    });
  });
});
