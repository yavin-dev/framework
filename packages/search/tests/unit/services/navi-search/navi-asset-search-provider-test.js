import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | navi-asset-search-provider', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let service;

  hooks.beforeEach(async function() {
    // Load metadata needed for request fragment
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    service = this.owner.lookup('service:navi-search/navi-asset-search-provider');
    const store = this.owner.lookup('service:store'),
      mockAuthor = store.createRecord('user', { id: 'ciela' });
    this.owner.register(
      'service:user',
      Service.extend({
        getUser: () => mockAuthor
      })
    );
  });

  test('construct full search query for reports', function(assert) {
    assert.expect(4);

    assert.deepEqual(
      service._constructSearchQuery('Hyrule', 'report'),
      {
        filter: { reports: "(title=='*Hyrule*',request=='*Hyrule*');author.id==ciela" },
        page: { limit: 10 }
      },
      'Constructs the correct report query for the api with both filter parameters and author.'
    );
    assert.deepEqual(
      service._constructSearchQuery(null, 'report'),
      {
        filter: { reports: 'author.id==ciela' },
        page: { limit: 10 }
      },
      'Constructs the correct report query for the api with author.'
    );
    assert.deepEqual(
      service._constructSearchQuery('Hyrule', 'dashboard'),
      {
        filter: { dashboards: "(title=='*Hyrule*');author.id==ciela" },
        page: { limit: 10 }
      },
      'Constructs the correct dashboard query for the api with both filter parameters and author.'
    );
    assert.deepEqual(
      service._constructSearchQuery(null, 'dashboard'),
      {
        filter: { dashboards: 'author.id==ciela' },
        page: { limit: 10 }
      },
      'Constructs the correct dashboard query for the api with author.'
    );
  });

  test('search by user search returns reports and dashboards', async function(assert) {
    assert.expect(5);

    const results = await service.search.perform('Revenue');
    assert.equal(results.component, 'navi-search-result/asset', 'Result contains correct display component name');
    assert.equal(results.title, 'Reports & Dashboards', 'Result contains correct title for the search result section');
    results.data.forEach(async function(result) {
      let author = await result.author;
      // Only Report objects have a request property.
      let hasRequest = !!result?.request;
      assert.ok(result.title.includes('Revenue'), 'The service returns a report that includes the requested title.');
      assert.ok(
        hasRequest ? result.request.includes('Revenue') : true,
        'The service returns reports that include the search query in the request'
      );
      assert.ok(author.id.includes('ciela'), 'The service returns a report from the requested user.');
    });
  });

  test('search with no results for search parameters', async function(assert) {
    assert.expect(3);

    const results = await service.search.perform('something');
    assert.equal(results.component, 'navi-search-result/asset', 'Result contains correct display component name');
    assert.equal(results.title, 'Reports & Dashboards', 'Result contains correct title for the search result section');
    assert.equal(results.data.length, 0, 'No reports are being returned when there is no match.');
  });

  test('search with empty parameters', async function(assert) {
    assert.expect(3);

    const results = await service.search.perform();
    assert.equal(results.component, 'navi-search-result/asset', 'Result contains correct display component name');
    assert.equal(results.title, 'Reports & Dashboards', 'Result contains correct title for the search result section');
    assert.equal(results.data.length, 0, 'No reports are being returned when there is no match.');
  });
});
