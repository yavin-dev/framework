import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | request-dimension-order', function(hooks) {
  setupTest(hooks);

  test('validate request-dimension-order', function(assert) {
    assert.expect(2);

    let Validator = this.owner.lookup('validator:request-dimension-order'),
      request = {
        dimensions: A([{ dimension: { name: 'd1' } }, { dimension: { name: 'd2' } }])
      };

    assert.equal(
      Validator.validate(A(['d1', 'd2']), { request }),
      true,
      'request-dimension-order returns `true` when dimension order matches request dimension order'
    );

    assert.equal(
      Validator.validate(A(['d2', 'd1']), { request }),
      false,
      'request-dimension-order returns `false` when dimension order does not match request dimension order'
    );
  });
});
