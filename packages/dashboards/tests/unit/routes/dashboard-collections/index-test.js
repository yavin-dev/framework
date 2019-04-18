import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Route;

module('Unit | Route | dashboard collections/index', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Route = this.owner.lookup('route:dashboard-collections/index');
  });

  test('model', async function(assert) {
    assert.expect(2);

    await run(async () => {
      const collections = await Route.model();
      assert.deepEqual(
        collections.map(c => c.id),
        ['1', '2', '3'],
        'Routes model returns the `navi_user`s dashboard collections'
      );

      assert.deepEqual(
        collections.map(c => c.title),
        ['Collection 1', 'Collection 2', 'Collection 3'],
        'the actual models of the dashboard collections can be retrieved through the model'
      );
    });
  });
});
