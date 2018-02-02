import { moduleFor, test } from 'ember-qunit';

let Serializer;

moduleFor('serializer:dimensions/bard', 'Unit | Serializer | Dimensions | Bard', {
  beforeEach() {
    Serializer = this.subject();
  }
});

test('normalize', function(assert) {
  assert.expect(2);

  assert.deepEqual(Serializer.normalize(),
    undefined,
    '`undefined` is returned for an undefined response');

  let rawPayload = {
    rows: [
      { id: 1, desc:'foo' }
    ],
    meta: { foo: 'bar' }
  };
  assert.equal(Serializer.normalize('dimensionOne', rawPayload),
    rawPayload.rows,
    'normalize returns the `rows` prop of the raw payload');
});
