import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('bard-request/fragments/metric', 'Unit | Serializer | Metric Fragment', {
  needs: ['serializer:bard-request/fragments/metric', 'transform:metric', 'service:bard-metadata']
});

test('serializing record', function(assert) {
  assert.expect(4);

  let record = Ember.run(() => {
    return this.store().createFragment('bard-request/fragments/metric', {
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

  record = Ember.run(() => {
    return this.store().createFragment('bard-request/fragments/metric', {
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

  record = Ember.run(() => {
    return this.store().createFragment('bard-request/fragments/metric', {
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

  record = Ember.run(() => {
    return this.store().createFragment('bard-request/fragments/metric', {
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
