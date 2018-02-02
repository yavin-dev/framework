import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';

const { getOwner } = Ember;

var MetadataService;

moduleFor('transform:table', 'Unit | Transform | Table',{
  needs: [
    'model:metadata/table',
    'model:metadata/time-grain',
    'model:metadata/dimension',
    'model:metadata/metric',
    'service:bard-metadata',
    'service:keg',
    'adapter:bard-metadata',
    'serializer:bard-metadata',
    'service:ajax',
    'service:bard-facts',
    'service:bard-dimensions',
    'adapter:dimensions/bard'
  ],
  beforeEach() {
    setupMock();
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    MetadataService.loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('serialize and deserialize', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    let transform = this.subject(),
        table = MetadataService.getById('table', 'network');

    assert.equal(transform.serialize(table),
      'network',
      'Table is serialized to the name');

    assert.equal(transform.deserialize('network'),
      table,
      'Table is deserialized to the right object');
  });
});
