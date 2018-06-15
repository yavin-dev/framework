import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

const { getOwner } = Ember;

let MetadataService;

moduleFor('service:metric-name', 'Unit | Service | metric long name', {
  needs: [
    'service:keg',
    'service:bard-metadata',
    'adapter:bard-metadata',
    'serializer:bard-metadata',
    'service:ajax',
    'model:metadata/table',
    'model:metadata/time-grain',
    'model:metadata/dimension',
    'model:metadata/metric'
  ],
  beforeEach() {
    setupMock();
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('getLongName', function(assert) {
  assert.expect(2);
  let service = this.subject();

  assert.equal(
    service.getLongName('revenue'),
    'Revenue',
    'Service can succesfully retrieve the long name for a valid metric'
  );

  assert.equal(
    service.getLongName('foo'),
    'foo',
    'The metric id is returned if there is no metadata found'
  );
});

test('getDisplayName', function(assert) {
  let service = this.subject();

  assert.equal(
    service.getDisplayName({ metric: 'adClicks', parameters: {} }),
    'Ad Clicks',
    'Service returns the long name for a non parameterized metric'
  );

  assert.equal(
    service.getDisplayName({
      metric: 'revenue',
      parameters: { currency: 'USD' },
      canonicalName: 'revenue(currency=USD)'
    }),
    'Revenue (USD)',
    'Service returns a correctly formatted metric name for a parameterized metric'
  );
});
