import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | dashboards/dashboard/widgets/add', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:dashboards/dashboard/widgets/add');
    assert.ok(controller);
  });
});
