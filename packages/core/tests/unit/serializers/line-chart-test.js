import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { getOwner } from '@ember/application';

let Serializer, Model;

moduleFor('serializer:line-chart', 'Unit | Serializer | line chart', {
  needs: [
    'model:line-chart',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-time-grain',
    'validator:request-dimension-order',
    'validator:length',
    'validator:request-filters'
  ],
  beforeEach() {
    const store = this.container.lookup('service:store');
    store.createRecord('line-chart');
    setupMock();
    Serializer = this.subject();
    Model = getOwner(this).factoryFor('model:line-chart').class;
  },
  afterEach() {
    teardownMock();
  }
});

test('normalize', function(assert) {
  assert.expect(2);

  let initialMetaData = {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {
                metrics: ['m1']
              }
            }
          }
        }
      }
    },
    expectedPayload = {
      data: {
        id: null,
        relationships: {},
        type: 'line-chart',
        attributes: {
          type: 'line-chart',
          version: 1,
          metadata: {
            axis: {
              y: {
                series: {
                  type: 'metric',
                  config: {
                    metrics: [{ metric: 'm1', parameters: {} }]
                  }
                }
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
});
