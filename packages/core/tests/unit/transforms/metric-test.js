import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import config from 'ember-get-config';

let MetadataService;

module('Unit | Transform | Metric', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  test('serialize and deserialize', async function(assert) {
    assert.expect(3);

    await settled();
    let transform = this.owner.lookup('transform:metric'),
      metric = MetadataService.getById('metric', 'pageViews');

    assert.equal(transform.serialize(metric), 'pageViews', 'Metric is serialized to the name');

    assert.equal(transform.deserialize('pageViews'), metric, 'Metric is deserialized to the right object');
    assert.equal(
      transform.deserialize('bardOne.pageViews'),
      metric,
      'namespaced metric is deserialized to the right object'
    );
  });

  test('deserialize with "." in id', function(assert) {
    assert.expect(2);

    const dataSources = config.navi.dataSources;

    this.owner.unregister('service:bard-metadata');
    this.owner.register(
      'service:bard-metadata',
      Service.extend({
        getById(type, id) {
          return { type, id };
        }
      })
    );
    const transform = this.owner.lookup('transform:metric');

    // Deserialize with no datasources defined in config
    config.navi.dataSources = undefined;

    assert.deepEqual(
      transform.deserialize('foo.bar'),
      { type: 'metric', id: 'foo.bar' },
      'Metric with "." in id does not split on the "."'
    );

    // Deserialize with 2 datasources defined in config
    config.navi.dataSources = dataSources;

    assert.deepEqual(
      transform.deserialize('bardOne.foo.bar'),
      { type: 'metric', id: 'foo.bar' },
      'Dimension with "." in id splits on the first "." when datasources are configured'
    );

    this.owner.unregister('service:bard-metadata');
    this.owner.register('service:bard-metadata', MetadataService, { instantiate: false });
  });

  test('datetime test', async function(assert) {
    assert.expect(2);

    await settled();
    let transform = this.owner.lookup('transform:metric'),
      metric = { id: 'dateTime' };

    assert.equal(transform.serialize(metric), 'dateTime', 'dateTime is serialized to the name');

    assert.deepEqual(
      transform.deserialize('dateTime'),
      { id: 'dateTime' },
      'dateTime is deserialized to the right object'
    );
  });
});
