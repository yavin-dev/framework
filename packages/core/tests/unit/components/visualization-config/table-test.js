import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

moduleForComponent('visualization-config/table', 'Unit | Component | table config', {
  unit: 'true',
  needs: [
    'service:bard-metadata',
    'service:keg',
    'adapter:bard-metadata',
    'serializer:bard-metadata',
    'model:metadata/table',
    'model:metadata/time-grain',
    'model:metadata/dimension',
    'model:metadata/metric',
    'service:ajax'
  ],
  beforeEach() {
    this.server = startMirage();
    Ember.getOwner(this)
      .lookup('service:bard-metadata')
      .loadMetadata();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('dimensions', function(assert) {
  assert.expect(1);

  let request = {
    dimensions: [
      { dimension: { name: 'os', longName: 'Operating System' } },
      { dimension: { name: 'age', longName: 'Age' } }
    ]
  };

  assert.deepEqual(
    Ember.A(this.subject({ request }).get('dimensions')).mapBy('longName'),
    ['Operating System', 'Age'],
    'The metadata for each of the dimensions in the request is fetched using the metadata service'
  );
});
