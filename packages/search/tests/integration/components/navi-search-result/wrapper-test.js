import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';

module('Integration | Component | navi-search-result-wrapper', function (hooks) {
  setupRenderingTest(hooks);

  test('no successful results tasks', async function (assert) {
    assert.expect(2);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: false,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample',
          data: [],
        },
      },
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert.dom('.navi-search-no-result').exists('No Results component shown');
    assert.dom('.navi-search-result-wrapper__loader').doesNotExist('Loader is not shown');
  });

  test('no results tasks return data', async function (assert) {
    assert.expect(2);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: true,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample',
          data: [],
        },
      },
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert.dom('.navi-search-no-result').exists('No Results component shown');
    assert.dom('.navi-search-result-wrapper__loader').doesNotExist('Loader is not shown');
  });

  test('results are loading', async function (assert) {
    assert.expect(2);

    set(this, 'searchResults', [
      {
        isRunning: true,
        isSuccessful: false,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample',
          data: [],
        },
      },
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert.dom('.navi-search-no-result').doesNotExist('No Results component is not shown');
    assert.dom('.navi-search-result-wrapper__loader').exists('Loader is shown.');
  });

  test('some results are shown and some results are loading', async function (assert) {
    assert.expect(3);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: true,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample Loaded',
          data: ['some data', 'some other data'],
        },
      },
      {
        isRunning: true,
        isSuccessful: false,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample Loading',
          data: [],
        },
      },
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert.dom('.navi-search-no-result').doesNotExist('No Results component is not shown');
    assert
      .dom('.navi-search-result-wrapper__item-title')
      .hasText('Sample Loaded', 'Loaded search results are displayed');
    assert.dom('.navi-search-result-wrapper__loader').exists('Loader is shown for pending search results.');
  });

  test('results rendered', async function (assert) {
    assert.expect(2);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: true,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample Loaded',
          data: ['some data', 'some other data'],
        },
      },
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert
      .dom('.navi-search-result-wrapper__item-title')
      .hasText('Sample Loaded', 'Loaded search results are displayed');
    assert.dom('.navi-search-result-wrapper__loader').doesNotExist('Loader is not shown');
  });

  test('multiple results rendered', async function (assert) {
    assert.expect(2);

    set(this, 'searchResults', [
      {
        isRunning: false,
        isSuccessful: true,
        value: {
          component: 'navi-search-result/sample',
          title: 'Sample Loaded',
          data: ['some data', 'some other data'],
        },
      },
      {
        isRunning: false,
        isSuccessful: true,
        value: {
          component: 'navi-search-result/sample',
          title: 'Another Sample Loaded',
          data: ['some data', 'some other data'],
        },
      },
    ]);
    set(this, 'closeResults', {});

    await render(
      hbs`<NaviSearchResult::Wrapper @searchResults={{this.searchResults}} @closeResults={{this.closeResults}} />`
    );

    assert.deepEqual(
      findAll('.navi-search-result-wrapper__item-title').map((el) => el.textContent.trim()),
      ['Sample Loaded', 'Another Sample Loaded'],
      'Loaded search results are displayed'
    );
    assert.dom('.navi-search-result-wrapper__loader').doesNotExist('Loader is not shown');
  });
});
