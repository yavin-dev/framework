import { serialize } from 'dummy/helpers/serialize';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | serialize', function (hooks) {
  setupTest(hooks);

  test("it throws an assertion if it's not serializable model", async function (assert) {
    assert.throws(
      () => serialize([{ some: 'object', will: 'fail' }]),
      'Fails an assert when object passed is not serializable.'
    );
  });
});
