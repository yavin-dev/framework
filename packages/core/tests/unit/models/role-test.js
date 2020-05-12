import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Store, MetadataService;

module('Unit | Model | role', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  test('Retrieving records', async function(assert) {
    assert.expect(1);

    await run(async () => {
      await Store.findRecord('role', 'admin');
      assert.ok(true, 'Found admin role');
    });
  });

  test('Saving records', async function(assert) {
    assert.expect(1);

    await run(async () => {
      const newRole = 'new_role';
      await Store.createRecord('role', { id: newRole }).save();

      Store.unloadAll('role'); // flush casche/store

      await Store.findRecord('role', newRole);
      assert.ok(true, 'Newly created role is successfully persisted');
    });
  });
});
