import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Serializer;

module('Unit | Serializer | Dimensions | Bard', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:dimensions/bard');
  });

  test('normalize', function(assert) {
    assert.expect(2);

    assert.deepEqual(Serializer.normalize(), undefined, '`undefined` is returned for an undefined response');

    let rawPayload = {
      rows: [{ id: 1, desc: 'foo' }],
      meta: { foo: 'bar' }
    };
    assert.equal(
      Serializer.normalize('dimensionOne', rawPayload),
      rawPayload.rows,
      'normalize returns the `rows` prop of the raw payload'
    );
  });
});
