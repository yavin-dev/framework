import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let Store;

module('Unit | Model | role', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    await this.owner.lookup('service:navi-metadata').loadMetadata();
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

  test('Delete records', async function(assert) {
    assert.expect(2);

    const newRole = 'new_role';
    await Store.createRecord('role', { id: newRole }).save();

    let rolesBefore = await Store.findAll('role', { reload: true });
    assert.deepEqual(
      rolesBefore.toArray().map(model => model.id),
      ['new_role', 'admin', 'user'],
      'Has three roles in the store'
    );

    const role = await Store.findRecord('role', newRole, { reload: true });
    await role.destroyRecord();

    const rolesAfter = await Store.findAll('role', { reload: true });
    assert.deepEqual(
      rolesAfter.toArray().map(model => model.id),
      ['admin', 'user'],
      'Deleted role new_role no longer in the store'
    );
  });
});
