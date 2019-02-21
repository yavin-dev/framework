import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | Metric Fragment', function(hooks) {
  setupTest(hooks);

  test('serializing record', function(assert) {
    assert.expect(4);

    let record = run(() => {
      return this.owner.lookup('service:store').createFragment('bard-request/fragments/metric', {
        metric: {
          name: 'test',
          longName: 'Test',
          type: 'number'
        },
        parameters: {}
      });
    });

    let serializedRecord = record.serialize();

    assert.deepEqual(
      serializedRecord,
      {
        metric: 'test'
      },
      'the serializer transforms metric without params with empty parameter key'
    );

    record = run(() => {
      return this.owner.lookup('service:store').createFragment('bard-request/fragments/metric', {
        metric: {
          name: 'test',
          longName: 'Test',
          type: 'number'
        },
        parameters: null
      });
    });

    serializedRecord = record.serialize();

    assert.deepEqual(
      serializedRecord,
      {
        metric: 'test'
      },
      'the serializer transforms metric without params with null parameter key'
    );

    record = run(() => {
      return this.owner.lookup('service:store').createFragment('bard-request/fragments/metric', {
        metric: {
          name: 'test',
          longName: 'Test',
          type: 'number'
        }
      });
    });

    serializedRecord = record.serialize();

    assert.deepEqual(
      serializedRecord,
      {
        metric: 'test'
      },
      'the serializer transforms metric without params with no parameter key'
    );

    record = run(() => {
      return this.owner.lookup('service:store').createFragment('bard-request/fragments/metric', {
        metric: {
          name: 'test',
          longName: 'Test',
          type: 'number'
        },
        parameters: {
          currency: 'USD',
          agg: 'YoY'
        }
      });
    });

    serializedRecord = record.serialize();

    assert.deepEqual(
      serializedRecord,
      {
        metric: 'test',
        parameters: {
          agg: 'YoY',
          currency: 'USD'
        }
      },
      'the serializer transforms metric with parameters'
    );
  });
});
