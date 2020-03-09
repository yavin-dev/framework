import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Service | metric long name', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('getLongName', function(assert) {
    assert.expect(2);
    let service = this.owner.lookup('service:metric-name');

    assert.equal(
      service.getLongName('revenue'),
      'Revenue',
      'Service can succesfully retrieve the long name for a valid metric'
    );

    assert.equal(service.getLongName('foo'), 'foo', 'The metric id is returned if there is no metadata found');
  });

  test('getDisplayName', function(assert) {
    let service = this.owner.lookup('service:metric-name');

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

  test('multi-data source support', async function(assert) {
    assert.expect(2);
    const metaData = this.owner.lookup('service:bard-metadata');
    metaData._keg.reset();
    await metaData.loadMetadata({ dataSourceName: 'blockhead' });

    let service = this.owner.lookup('service:metric-name');

    assert.equal(
      service.getDisplayName({ metric: 'usedAmount', parameters: {} }, 'blockhead'),
      'Used Amount',
      'Service returns the long name for a non parameterized metric'
    );

    assert.equal(
      service.getLongName('available', 'blockhead'),
      'How many are available',
      'Service can succesfully retrieve the long name for a valid metric'
    );

    metaData._keg.reset();
  });
});
