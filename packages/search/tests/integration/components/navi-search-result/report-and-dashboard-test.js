import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Service from '@ember/service';
import { set } from '@ember/object';

module('Integration | Component | navi-search-result-report-and-dashboard', function(hooks) {
  setupRenderingTest(hooks);
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

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<NaviSearchResult::ReportAndDashboard />`);

    assert.equal(this.element.textContent.trim(), 'Reports & Dashboards');
  });

  test('displays results', async function(assert) {
    const result = await this.service.search('Revenue');
    set(this, 'result', result.find(element => element.component === 'navi-search-result/report-and-dashboard'));

    await render(hbs`<NaviSearchResult::ReportAndDashboard @data={{this.result.data}}/>`);

    assert.dom('li').hasText('Revenue report 1', 'Showing search results');
  });
});
