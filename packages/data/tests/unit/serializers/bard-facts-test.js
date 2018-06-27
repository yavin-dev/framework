import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Serializer;

module('Unit | Bard Facts Serializer', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:bard-facts');
  });

  test('normalize', function(assert) {
    assert.expect(4);

    assert.deepEqual(Serializer.normalize(),
      undefined,
      '`undefined` is returned for an undefined response');

    assert.deepEqual(Serializer.normalize({foo: 'bar'}),
      {
        rows: undefined,
        meta: {}
      },
      'Rows property is `undefined` and meta is empty when they are missing from the payload');

    assert.deepEqual(Serializer.normalize({rows: 'bar'}),
      {
        rows: 'bar',
        meta: {}
      },
      'meta property is empty when missing from the payload');

    assert.deepEqual(Serializer.normalize({rows: 'bar', meta: { next: 'nextLink' }}),
      {
        rows: 'bar',
        meta: { next: 'nextLink' }
      },
      'meta and rows property are populated as in the payload');
  });
});
