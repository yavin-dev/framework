import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let MetadataService;

module('Unit | Transform | Metric', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  test('serialize and deserialize', async function(assert) {
    assert.expect(2);

    await settled();
    let transform = this.owner.lookup('transform:metric'),
      metric = MetadataService.getById('metric', 'pageViews');

    assert.equal(transform.serialize(metric), 'pageViews', 'Metric is serialized to the name');

    assert.equal(transform.deserialize('pageViews'), metric, 'Metric is deserialized to the right object');
  });

  test('datetime test', async function(assert) {
    assert.expect(2);

    await settled();
    let transform = this.owner.lookup('transform:metric'),
      metric = { name: 'dateTime' };

    assert.equal(transform.serialize(metric), 'dateTime', 'dateTime is serialized to the name');

    assert.deepEqual(
      transform.deserialize('dateTime'),
      { name: 'dateTime' },
      'dateTime is deserialized to the right object'
    );
  });
});
