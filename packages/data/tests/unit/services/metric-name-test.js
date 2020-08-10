import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | metric name', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('getName', function(assert) {
    const service = this.owner.lookup('service:metric-name');

    assert.equal(
      service.getName('revenue', 'bardOne'),
      'Revenue',
      'Service can successfully retrieve the long name for a valid metric'
    );

    assert.equal(service.getName('foo', 'bardOne'), 'foo', 'The metric id is returned if there is no metadata found');
  });

  test('getDisplayName', function(assert) {
    const service = this.owner.lookup('service:metric-name');

    assert.equal(
      service.getDisplayName({ metric: 'adClicks', parameters: {}, source: 'bardOne' }),
      'Ad Clicks',
      'Service returns the long name for a non parameterized metric'
    );

    assert.equal(
      service.getDisplayName({
        metric: 'revenue',
        parameters: { currency: 'USD' },
        canonicalName: 'revenue(currency=USD)',
        source: 'bardOne'
      }),
      'Revenue (USD)',
      'Service returns a correctly formatted metric name for a parameterized metric'
    );
  });

  test('multi-data source support', async function(assert) {
    const metaData = this.owner.lookup('service:navi-metadata');
    await metaData.loadMetadata({ dataSourceName: 'bardTwo' });
    const service = this.owner.lookup('service:metric-name');

    assert.equal(
      service.getDisplayName({ metric: 'usedAmount', parameters: {}, source: 'bardTwo' }),
      'Used Amount',
      'Service returns the long name for a non parameterized metric'
    );

    assert.equal(
      service.getName('available', 'bardTwo'),
      'How many are available',
      'Service can successfully retrieve the long name for a valid metric'
    );
  });
});
