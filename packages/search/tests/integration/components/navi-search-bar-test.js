import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click, fillIn, triggerKeyEvent } from '@ember/test-helpers';
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

  test('click search button no results', async function(assert) {
    await render(hbs`<NaviSearchBar />`);
    debugger;

    await fillIn('.search-input', 'Hello!');

    await click(find('.search-button'));

    assert.dom('.results').doesNotExist();
  });

  test('press enter on search button with results', async function(assert) {
    await render(hbs`<NaviSearchBar />`);

    await fillIn('.search-input', 'Revenue');
    await triggerKeyEvent('.search-input', 'keydown', 13);
    debugger;

    assert.dom('.results').exists();
    assert.dom('.results').hasClass('search-result');
  });
});
