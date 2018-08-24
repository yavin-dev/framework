import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { getOwner } from '@ember/application';

let Serializer, Model;

moduleFor('serializer:goal-gauge', 'Unit | Serializer | goal gauge', {
  needs: [
    'model:goal-gauge',
    'validator:request-metric-exist',
  ],
  beforeEach() {
    setupMock();
    Serializer = this.subject();
    Model = getOwner(this).factoryFor('model:goal-gauge').class;
  },
  afterEach() {
    teardownMock();
  }
});

test('normalize', function(assert) {
  assert.expect(3);

  let initialMetaData = {
        version: 1,
        type: 'goal-gauge',
        metadata: {
          metric: 'rupees',
          baselineValue: 1000,
          goalValue: 1500,
          metricTitle: null,
          unit: null,
          prefix: null
        }
      },
      metricObjectMetaData = {
        version: 1,
        type: 'goal-gauge',
        metadata: {
          metric: {metric: 'rupees', parameters: {}},
          baselineValue: 1000,
          goalValue: 1500,
          metricTitle: null,
          unit: null,
          prefix: null
        }
      },
      expectedPayload = {
        data: {
          id: null,
          relationships: {},
          type: 'goal-gauge',
          attributes: {
            version: 1,
            type: 'goal-gauge',
            metadata: {
              metric: {metric: 'rupees', parameters: {}},
              baselineValue: 1000,
              goalValue: 1500,
              metricTitle: null,
              unit: null,
              prefix: null
            }
          }
        }
      };

  assert.deepEqual(Serializer.normalize(),
    {data: null},
    'null is returned for an undefined response');

  assert.deepEqual(Serializer.normalize(Model, initialMetaData),
    expectedPayload,
    'Config with a metric name stored is successfully converted to an object for a non-parameterized metric');

  assert.deepEqual(Serializer.normalize(Model, metricObjectMetaData),
    expectedPayload,
    'Config with a metric object stored is unchanged');

});
