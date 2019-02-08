import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

let Serializer, Model;

moduleFor('serializer:pie-chart', 'Unit | Serializer | pie chart', {
  needs: [
    'model:pie-chart',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'validator:length'
  ],
  beforeEach() {
    setupMock();
    Serializer = this.subject();
    const store = this.container.lookup('service:store');
    Model = store.modelFor('pie-chart');
  },
  afterEach() {
    teardownMock();
  }
});

test('normalize', function(assert) {
  assert.expect(3);

  let initialMetaData = {
      type: 'pie-chart',
      version: 1,
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: 'm1'
          }
        }
      }
    },
    metricObjectMetaData = {
      type: 'pie-chart',
      version: 1,
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: { metric: 'm1', parameters: {} }
          }
        }
      }
    },
    expectedPayload = {
      data: {
        id: null,
        relationships: {},
        type: 'pie-chart',
        attributes: {
          type: 'pie-chart',
          version: 1,
          metadata: {
            series: {
              type: 'dimension',
              config: {
                metric: { metric: 'm1', parameters: {} }
              }
            }
          }
        }
      }
    };

  assert.deepEqual(Serializer.normalize(), { data: null }, 'null is returned for an undefined response');

  assert.deepEqual(
    Serializer.normalize(Model, initialMetaData),
    expectedPayload,
    'Config with a metric name stored is successfully converted to an object for a non-parameterized metric'
  );

  assert.deepEqual(
    Serializer.normalize(Model, metricObjectMetaData),
    expectedPayload,
    'Config with a metric object stored is unchanged'
  );
});
