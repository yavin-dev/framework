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
    let availableSearchProviders = this.service.all();
    assert.equal(availableSearchProviders.length, 1, 'Discovered 1 search provider.');
  });

  test('search all providers', async function(assert) {
    let results = await this.service.search('Revenue');
    assert.ok(results.length > 0, 'Returns multiple results');
  });

  test('search with no results', async function(assert) {
    let results = await this.service.search('something');
    assert.ok(results.length == 0, 'Returns no results');
  });

  test('search with special characters', async function(assert) {
    let results = await this.service.search('lala!@#$%^&*');
    assert.ok(results.length == 0, 'Returns no results');
  });
});
