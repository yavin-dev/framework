import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | navi-search-provider', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    this.service = this.owner.lookup('service:navi-search-provider');
  });

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:navi-search-provider');
    assert.ok(service);
  });

  test('get all search providers', function(assert) {
    let availableSearchProviders = this.service._all();
    let systemSearchProviders = ['NaviSampleSearchProviderService'];
    assert.deepEqual(
      availableSearchProviders.map(provider => provider.constructor.name),
      systemSearchProviders,
      'Discovered 1 search provider.'
    );
  });

  test('search all providers', async function(assert) {
    let results = await this.service.search.perform('Revenue');
    assert.ok(
      results.every(
        result => result.data.every(d => d.includes('Revenue')) && result.component === 'navi-search-result/sample'
      ),
      'Returns multiple results'
    );
  });

  test('search with no results', async function(assert) {
    let results = await this.service.search.perform('something');
    assert.equal(results.length, 0, 'Returns no results');
  });
});
