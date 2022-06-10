import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | yavin-client', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:yavin-client');
    assert.ok(service);
  });
});
