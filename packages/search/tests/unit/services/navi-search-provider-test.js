import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | navi-search-provider', function(hooks) {
  setupTest(hooks);

  let Service;

  hooks.beforeEach(async function() {
    Service = this.owner.lookup('service:navi-search-provider');
  });

  test('it exists', function(assert) {
    assert.ok(Service);
  });

  test('get all search providers', function(assert) {
    let availableSearchProviders = Service._all();
    let systemSearchProviders = ['NaviSampleSearchProviderService'];
    assert.deepEqual(
      availableSearchProviders.map(provider => provider.constructor.name),
      systemSearchProviders,
      'Discovered 1 search provider.'
    );
  });

  test('search all providers', async function(assert) {
    let results = await Service.search.perform('Revenue');
    assert.ok(
      results.every(
        result => result.data.every(d => d.includes('Revenue')) && result.component === 'navi-search-result/sample'
      ),
      'Returns multiple results'
    );
  });

  test('search with no results', async function(assert) {
    let results = await Service.search.perform('something');
    assert.equal(results.length, 0, 'Returns no results');
  });
});
