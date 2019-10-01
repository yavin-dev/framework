import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Serializer, Model;

module('Unit | Serializer | metric label', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:metric-label');
    const store = this.owner.lookup('service:store');
    Model = store.modelFor('metric-label');
  });

  test('normalize', function(assert) {
    assert.expect(3);

    let initialMetaData = {
        version: 1,
        type: 'metric-label',
        metadata: {
          metric: 'rupees',
          description: 'Rupees',
          format: '0,0.00'
        }
      },
      metricObjectMetaData = {
        version: 1,
        type: 'metric-label',
        metadata: {
          metric: { metric: 'rupees', parameters: {} },
          description: 'Rupees',
          format: '0,0.00'
        }
      },
      expectedPayload = {
        data: {
          id: null,
          relationships: {},
          type: 'metric-label',
          attributes: {
            version: 1,
            type: 'metric-label',
            metadata: {
              metric: { metric: 'rupees', parameters: {} },
              description: 'Rupees',
              format: '0,0.00'
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
