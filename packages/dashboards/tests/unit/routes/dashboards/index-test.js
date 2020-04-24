import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Route | dashboards/index', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    // Load metadata needed for request fragment
    await this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('model', async function(assert) {
    assert.expect(2);

    const route = this.owner.lookup('route:dashboards/index');
    await run(async () => {
      const model = await route.model();
      const dashboards = await model.get('dashboards');

      assert.deepEqual(
        dashboards.map(d => d.id),
        ['1', '2', '5'],
        'Routes model returns the `navi_user`s dashboards'
      );

      assert.deepEqual(
        dashboards.map(d => d.title),
        ['Tumblr Goals Dashboard', 'Dashboard 2', 'Empty Dashboard'],
        'the actual models of the dashboards can be retrieved through the model'
      );
    });
  });
});
