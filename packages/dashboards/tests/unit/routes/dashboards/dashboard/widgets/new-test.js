import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import config from 'ember-get-config';
import { setupMock, teardownMock } from '../../../../../helpers/mirage-helper';

const { get, set } = Ember;

const defaultDataTable = get(config, 'navi.defaultDataTable');
const NEW_MODEL = {
  createdOn: null,
  requests: [
    {
      bardVersion: 'v1',
      dimensions: [],
      filters: [],
      intervals: [
        {
          end: 'current',
          start: 'P1D'
        }
      ],
      logicalTable: {
        table: 'tableA',
        timeGrain: 'day'
      },
      metrics: [],
      having: [],
      sort: [],
      requestVersion: 'v1',
      responseFormat: 'json'
    }
  ],
  title: 'Untitled Widget',
  updatedOn: null,
  visualization: {
    type: 'line-chart',
    version: 1,
    metadata: {
      axis: {
        y: {
          series: {
            type: null,
            config: {}
          }
        }
      }
    }
  },
  dashboard: 'dashboard1'
};

let Store, Route;

moduleFor(
  'route:dashboards/dashboard/widgets/new',
  'Unit | Route | dashboards/dashboard/widgets/new',
  {
    needs: [
      'adapter:report',
      'adapter:user',
      'model:dashboard-widget',
      'model:dashboard',
      'model:delivery-rule',
      'model:report',
      'model:user',
      'transform:array',
      'transform:fragment-array',
      'transform:dimension',
      'transform:fragment',
      'transform:metric',
      'transform:moment',
      'transform:table',
      'transform:dimension',
      'model:line-chart',
      'model:bard-request/request',
      'model:bard-request/fragments/dimension',
      'model:bard-request/fragments/filter',
      'model:bard-request/fragments/interval',
      'model:bard-request/fragments/logicalTable',
      'model:bard-request/fragments/metric',
      'model:bard-request/fragments/sort',
      'serializer:bard-request/fragments/logical-table',
      'serializer:bard-request/fragments/interval',
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
      'adapter:bard-metadata',
      'serializer:report',
      'serializer:user',
      'serializer:bard-metadata',
      'service:keg',
      'service:ajax',
      'service:bard-facts',
      'service:user',
      'model:metadata/table',
      'model:metadata/dimension',
      'model:metadata/metric',
      'model:metadata/time-grain',
      'service:bard-dimensions',
      'adapter:dimensions/bard',
      'service:navi-notifications',
      'service:navi-visualizations',
      'service:model-compression'
    ],
    beforeEach() {
      setupMock();

      Store = this.container.lookup('service:store');

      Route = this.subject({
        modelFor: () =>
          Store.createRecord('dashboard', {
            id: 'dashboard1',
            author: 'navi_user'
          })
      });

      set(config, 'navi.defaultDataTable', 'tableA');

      return this.container.lookup('service:bard-metadata').loadMetadata();
    },
    afterEach() {
      set(config, 'navi.defaultDataTable', defaultDataTable);

      teardownMock();
    }
  }
);

test('model', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    return Route.model(null, { queryParams: {} }).then(model => {
      assert.deepEqual(
        model.toJSON(),
        NEW_MODEL,
        'A new widget model is returned'
      );

      assert.equal(
        model.get('author.id'),
        'navi_user',
        'the author of the widget is set using the author from the dashboard'
      );
    });
  });
});

test('_newModel', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    return Route._newModel().then(model => {
      assert.deepEqual(
        model.toJSON(),
        NEW_MODEL,
        'A new widget model is returned'
      );

      assert.equal(
        model.get('author.id'),
        'navi_user',
        'the author of the widget is set using the author from the dashboard'
      );
    });
  });
});
