import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { getOwner } from '@ember/application';

let Serializer, Model;

moduleFor('serializer:metric-label', 'Unit | Serializer | metric label', {
  needs: ['model:metric-label', 'validator:request-metric-exist'],
  beforeEach() {
    const store = this.container.lookup('service:store');
    store.createRecord('metric-label');
    setupMock();
    Serializer = this.subject();
    Model = getOwner(this).factoryFor('model:metric-label').class;
  },
  afterEach() {
    teardownMock();
  }
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
