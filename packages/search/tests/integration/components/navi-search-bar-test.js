import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | navi-search-bar', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:bard-metadata').loadMetadata();
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

    await render(hbs`<NaviSearchBar />`);

    assert.equal(this.element.textContent.trim(), '');
  });

  test('perform search that returns results', async function(assert) {
    await render(hbs`<NaviSearchBar />`);

    await fillIn('.navi-search-bar__input', 'Revenue');
    await triggerKeyEvent('.navi-search-bar__input', 'keyup', 13);

    assert
      .dom('.navi-search-bar__results')
      .hasText('Reports & Dashboards Revenue report 1 Revenue Dashboard Sample Revenue result Revenue success');
  });

  test('perform search with special characters', async function(assert) {
    await render(hbs`<NaviSearchBar />`);

    await fillIn('.navi-search-bar__input', '!@#$%^&*()');
    await triggerKeyEvent('.navi-search-bar__input', 'keyup', 13);

    assert.dom('.navi-search-bar__results').hasText('No results', 'Search results return "No results"');
  });

  test('perform search with no results', async function(assert) {
    await render(hbs`<NaviSearchBar />`);

    await fillIn('.navi-search-bar__input', 'Hello!');
    await triggerKeyEvent('.navi-search-bar__input', 'keyup', 13);

    assert.dom('.navi-search-bar__results').hasText('No results', 'Search results return "No results"');
  });

  test('perform empty search', async function(assert) {
    await render(hbs`<NaviSearchBar />`);

    await fillIn('.navi-search-bar__input', '');
    await triggerKeyEvent('.navi-search-bar__input', 'keyup', 13);

    assert.dom('.navi-search-bar__results').doesNotExist('Nothing happens if you search with empty query');
  });
});
