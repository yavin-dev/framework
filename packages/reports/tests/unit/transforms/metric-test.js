import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';

const { getOwner } = Ember;

var MetadataService;

moduleFor('transform:metric', 'Unit | Transform | Metric',{
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
        metric = MetadataService.getById('metric', 'pageViews');

    assert.equal(transform.serialize(metric),
      'pageViews',
      'Metric is serialized to the name');

    assert.equal(transform.deserialize('pageViews'),
      metric,
      'Metric is deserialized to the right object');
  });
});
