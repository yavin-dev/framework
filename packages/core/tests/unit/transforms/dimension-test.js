import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';

const { getOwner } = Ember;

let MetadataService;

moduleFor('transform:dimension', 'Unit | Transform | Dimension', {
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
      dim = MetadataService.getById('dimension', 'os');

    assert.equal(transform.serialize(dim), 'os', 'Dimension is serialized to the name');

    assert.equal(transform.deserialize('os'), dim, 'Dimension is deserialized to the right object');
  });
});

test('Do not cause crash when metadata is not available', function(assert) {
  assert.expect(1);

  let transform = this.subject();
  assert.equal(transform.serialize(undefined), null, 'Dimension properly return null without crashing.');
});
