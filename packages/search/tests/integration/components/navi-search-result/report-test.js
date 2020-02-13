import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Service from '@ember/service';

module('Integration | Component | navi-search-result-report', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    // Load metadata needed for request fragment
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    this.service = this.owner.lookup('service:navi-report-search-provider');
    const store = this.owner.lookup('service:store'),
      mockAuthor = store.createRecord('user', { id: 'ciela' });
    this.owner.register(
      'service:user',
      Service.extend({
        getUser: () => mockAuthor
      })
    );
  });

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<NaviSearchResult::Report />`);

    assert.equal(this.element.textContent.trim(), '');
  });

  test('fetches results', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<NaviSearchResult::Report @query="Revenue"/>`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
