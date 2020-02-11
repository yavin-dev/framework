import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | navi-search-result', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:navi-search-result');
    assert.ok(service);
  });

  test('get all search providers', function(assert) {
    let service = this.owner.lookup('service:navi-search-result');
    let availableSearchProviders = service.all();
    assert.equal(availableSearchProviders.length, 1, 'Discovered 1 search provider.');
  });
});
