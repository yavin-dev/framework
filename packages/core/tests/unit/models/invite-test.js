import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Store, MetadataService;

const ExpectedAssignedRoles = {
  data: [
    {
      id: 'admin',
      type: 'roles'
    }
  ]
};

const ExpectedInvite = {
  data: {
    attributes: {
      code: 'asdfasdf',
      createdOn: '2001-01-20 00:00:00.000',
      expiresOn: '2001-01-20 00:00:00.000',
      modifiedOn: '2001-01-20 00:00:00.000'
    },
    relationships: {
      assignedRoles: ExpectedAssignedRoles,
      user: {
        data: {
          id: 'navi_user',
          type: 'users'
        }
      }
    },
    type: 'invites'
  }
};

module('Unit | Model | invite', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  test('Retrieving records', async function(assert) {
    assert.expect(2);

    await run(async () => {
      const invite = await Store.findRecord('invite', 1);
      assert.ok(true, 'Found invite with id 1');
      assert.deepEqual(invite.serialize(), ExpectedInvite, 'Fetched invite has all attributes as expected');
    });
  });

  test('Saving records', async function(assert) {
    assert.expect(1);

    await run(async () => {
      const user = await Store.findRecord('user', 'navi_user');
      const invite = {
        code: '123hjkl',
        userId: user.id,
        userEmail: user.email,
        assignedRoleId: ['admin']
      };
      const savedInvite = await Store.createRecord('invite', invite).save();
      const id = savedInvite.get('id');
      Store.unloadAll('invite'); // flush casche/store

      await Store.findRecord('invite', id);
      assert.ok(true, 'Newly created invite is successfully persisted');
    });
  });
});
