import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type StoreService from '@ember-data/store';

module('Unit | Serializer | table', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('serialize', async function (assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const tableProps = {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {},
      },
    };
    const table = store.createFragment('table', tableProps);
    const serialized = table.serialize();
    assert.deepEqual(
      serialized,
      {
        ...tableProps,
        namespace: null,
      },
      'namespace should be set to null after serializing'
    );
  });
});
