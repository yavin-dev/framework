import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';

module('Integration | Component | navi-search-result-wrapper', function(hooks) {
  setupRenderingTest(hooks);

  test('no results tasks are not succeeded', async function(assert) {
    assert.expect(1);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: false,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample',
          data: []
        }
      }
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert.dom('.navi-search-no-result').exists('No Results component shown');
  });

  test('no results tasks return no data', async function(assert) {
    assert.expect(1);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: true,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample',
          data: []
        }
      }
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert.dom('.navi-search-no-result').exists('No Results component shown');
  });

  test('results are loading', async function(assert) {
    assert.expect(1);

    set(this, 'searchResults', [
      {
        isRunning: true,
        isSuccessful: false,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample',
          data: []
        }
      }
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert.dom('.navi-search-result-wrapper__loader').exists('Loader is shown.');
  });

  test('some results are shown and some results are loading', async function(assert) {
    assert.expect(2);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: true,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample Loaded',
          data: ['some data', 'some other data']
        }
      },
      {
        isRunning: true,
        isSuccessful: false,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample Loading',
          data: []
        }
      }
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert
      .dom('.navi-search-result-wrapper__item-title')
      .hasText('Sample Loaded', 'Loaded search results are displayed');
    assert.dom('.navi-search-result-wrapper__loader').exists('Loader is shown for pending search results.');
  });

  test('results rendered', async function(assert) {
    assert.expect(1);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: true,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample Loaded',
          data: ['some data', 'some other data']
        }
      }
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert
      .dom('.navi-search-result-wrapper__item-title')
      .hasText('Sample Loaded', 'Loaded search results are displayed');
  });
});
