import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Serializer, Model;

module('Unit | Serializer | Logical Table Fragment', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:bard-request/fragments/logical-table');
    Model = this.owner.factoryFor('model:bard-request/fragments/logical-table').class;
  });

  test('serializing record', function(assert) {
    let record = run(() => {
      return this.owner.lookup('service:store').createFragment('bard-request/fragments/logical-table', {
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
});
