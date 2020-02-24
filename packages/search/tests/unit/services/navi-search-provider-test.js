import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Service | navi-search-provider', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    // Load metadata needed for request fragment
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    this.service = this.owner.lookup('service:navi-search-provider');
    const store = this.owner.lookup('service:store'),
      mockAuthor = store.createRecord('user', { id: 'ciela' });
    this.owner.register(
      'service:user',
      Service.extend({
        getUser: () => mockAuthor
      })
    );
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
});
