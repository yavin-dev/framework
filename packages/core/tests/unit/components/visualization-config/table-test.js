import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

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
    setupMock();
    getOwner(this)
      .lookup('service:bard-metadata')
      .loadMetadata();
  },
  afterEach() {
    teardownMock();
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
    A(this.subject({ request }).get('dimensions')).mapBy('longName'),
    ['Operating System', 'Age'],
    'The metadata for each of the dimensions in the request is fetched using the metadata service'
  );
});
