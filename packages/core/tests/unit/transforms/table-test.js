import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

var MetadataService;

module('Unit | Transform | Table', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    setupMock();
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('serialize and deserialize', async function(assert) {
    assert.expect(2);

    await settled();
    let transform = this.owner.lookup('transform:table'),
      table = MetadataService.getById('table', 'network');

    assert.equal(transform.serialize(table), 'network', 'Table is serialized to the name');

    assert.equal(transform.deserialize('network'), table, 'Table is deserialized to the right object');
  });
});
