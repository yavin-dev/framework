import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';

let MetadataService;

module('Unit | Transform | Table', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  test('serialize and deserialize', async function(assert) {
    assert.expect(3);

    await settled();
    let transform = this.owner.lookup('transform:table'),
      table = MetadataService.getById('table', 'network');

    assert.equal(transform.serialize(table), 'network', 'Table is serialized to the name');

    assert.equal(transform.deserialize('network'), table, 'Table is deserialized to the right object');
    assert.equal(
      transform.deserialize('bardOne.network'),
      table,
      'namespaced table is deserialized to the right object'
    );
  });
});
