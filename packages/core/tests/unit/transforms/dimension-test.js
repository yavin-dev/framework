import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import config from 'ember-get-config';

let MetadataService;

module('Unit | Transform | Dimension', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  });

  test('serialize and deserialize', async function(assert) {
    assert.expect(3);

    await settled();
    const transform = this.owner.lookup('transform:dimension');
    const dim = MetadataService.getById('dimension', 'os');

    assert.equal(transform.serialize(dim), 'os', 'Dimension is serialized to the name');

    assert.equal(transform.deserialize('os'), dim, 'Dimension is deserialized to the right object');

    assert.equal(transform.deserialize('bardOne.os'), dim, 'Dimension with namespace is deserialized to right object');
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
    const transform = this.owner.lookup('transform:dimension');

    // Deserialize with no datasources defined in config
    config.navi.dataSources = undefined;

    assert.deepEqual(
      transform.deserialize('foo.bar'),
      { type: 'dimension', id: 'foo.bar' },
      'Dimension with "." in id does not split on the "."'
    );

    // Deserialize with 2 datasources defined in config
    config.navi.dataSources = dataSources;

    assert.deepEqual(
      transform.deserialize('bardOne.foo.bar'),
      { type: 'dimension', id: 'foo.bar' },
      'Dimension with "." in id splits on the first "." when datasources are configured'
    );

    this.owner.unregister('service:bard-metadata');
    this.owner.register('service:bard-metadata', MetadataService, { instantiate: false });
  });

  test('Do not cause crash when metadata is not available', function(assert) {
    assert.expect(1);

    let transform = this.owner.lookup('transform:dimension');
    assert.equal(transform.serialize(undefined), null, 'Dimension properly return null without crashing.');
  });
});
