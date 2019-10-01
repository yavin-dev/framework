import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Serializer, Model;

module('Unit | Serializer | goal gauge', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:goal-gauge');
    const store = this.owner.lookup('service:store');
    Model = store.modelFor('goal-gauge');
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
          metric: { metric: 'rupees', parameters: {} },
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
              metric: { metric: 'rupees', parameters: {} },
              baselineValue: 1000,
              goalValue: 1500,
              metricTitle: null,
              unit: null,
              prefix: null
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
});
