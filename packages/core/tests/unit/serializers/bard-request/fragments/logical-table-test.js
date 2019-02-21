import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleForModel, test } from 'ember-qunit';

let Serializer, Model;

moduleForModel('bard-request/fragments/logical-table', 'Unit | Serializer | Logical Table Fragment', {
  needs: ['serializer:bard-request/fragments/logical-table', 'transform:table', 'service:bard-metadata'],

  beforeEach() {
    Serializer = getOwner(this).lookup('serializer:bard-request/fragments/logical-table');
    Model = getOwner(this).factoryFor('model:bard-request/fragments/logical-table').class;
  }
});

test('serializing record', function(assert) {
  let record = run(() => {
    return this.store().createFragment('bard-request/fragments/logical-table', {
      table: { name: 'network' },
      timeGrainName: 'day'
    });
  });

  let serializedRecord = record.serialize();

  assert.deepEqual(
    serializedRecord,
    {
      table: 'network',
      timeGrain: 'day'
    },
    'the serializer transforms timeGrainName to timeGrain when serializing'
  );
});

test('normalizing record', function(assert) {
  let payload = {
    table: 'network',
    timeGrain: 'day'
  };

  Serializer.normalizeUsingDeclaredMapping(Model, payload);

  assert.deepEqual(
    payload,
    {
      table: 'network',
      timeGrainName: 'day'
    },
    'the serializer transforms timeGrain to timeGrainName when deserializing'
  );
});
