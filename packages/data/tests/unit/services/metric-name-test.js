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
});
