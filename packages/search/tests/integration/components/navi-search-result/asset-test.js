import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Service from '@ember/service';
import { set } from '@ember/object';

module('Integration | Component | navi-search-result-asset', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  let service;

  hooks.beforeEach(async function() {
    // Load metadata needed for request fragment
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    service = this.owner.lookup('service:navi-search-provider');
    const store = this.owner.lookup('service:store'),
      mockAuthor = store.createRecord('user', { id: 'ciela' });
    this.owner.register(
      'service:user',
      Service.extend({
        getUser: () => mockAuthor
      })
    );
  });

  test('displays results', async function(assert) {
    const result = await service.search.perform('Revenue');
    set(this, 'result', result.find(element => element.component === 'navi-search-result/asset'));

    await render(hbs`<NaviSearchResult::Asset @data={{this.result.data}}/>`);

    assert.dom('li').exists({ count: 2 });
    let results = findAll('li');
    let expectedResults = ['Revenue report 1', 'Revenue Dashboard'];
    assert.deepEqual(
      results.map(result => result.textContent.trim()),
      expectedResults,
      'Displayed correct search result.'
    );
  });
});
