import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

let MetadataService;

module('Unit | Transform | Dimension', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    MetadataService = this.owner.lookup('service:bard-metadata');
    MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('serialize and deserialize', async function(assert) {
    assert.expect(2);

    await settled();
    let transform = this.owner.lookup('transform:dimension'),
      dim = MetadataService.getById('dimension', 'os');

    assert.equal(transform.serialize(dim), 'os', 'Dimension is serialized to the name');

    assert.equal(transform.deserialize('os'), dim, 'Dimension is deserialized to the right object');
  });

  test('Do not cause crash when metadata is not available', function(assert) {
    assert.expect(1);

    let transform = this.owner.lookup('transform:dimension');
    assert.equal(transform.serialize(undefined), null, 'Dimension properly return null without crashing.');
  });
});
