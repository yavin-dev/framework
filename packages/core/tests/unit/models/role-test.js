import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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

    const role = await Store.findRecord('role', 'admin');
    assert.ok(role, 'Found admin role');
  });

  test('Saving records', async function(assert) {
    assert.expect(2);

    const newRole = 'new_role';
    await Store.createRecord('role', { id: newRole }).save();

    const role = await Store.findRecord('role', newRole, { reload: true });
    assert.ok(role, 'Newly created role is successfully persisted');
    assert.equal(role.id, newRole, 'Role id of new role is set as expected');
  });
});
