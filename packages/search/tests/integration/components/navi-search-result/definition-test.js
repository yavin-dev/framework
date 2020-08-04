import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';
import Service from '@ember/service';

class MetadataServiceStub extends Service {
  loadedDataSources = ['bardOne', 'bardTwo'];
}

module('Integration | Component | definition', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.owner.register('service:bard-metadata', MetadataServiceStub);
  });

  test('displays results', async function(assert) {
    assert.expect(3);

    const data = [
      {
        id: 'pageViews',
        name: 'Page Views',
        description: 'The number of views of a page.'
      },
      {
        id: 'impressions',
        name: 'Impressions',
        description: 'Number of times a user saw the ad.'
      }
    ];
    set(this, 'data', data);

    await render(hbs`<NaviSearchResult::Definition @data={{this.data}} />`);

    assert.dom('.navi-search-definition-result').exists({ count: 2 }, 'Two results are displayed');

    assert.deepEqual(
      findAll('.navi-search-definition-result__item-name').map(el => el.textContent.trim()),
      ['Page Views', 'Impressions'],
      'definition titles are shown correctly'
    );
    assert.deepEqual(
      findAll('.navi-search-definition-result__item-description').map(el => el.textContent.trim()),
      ['The number of views of a page.', 'Number of times a user saw the ad.'],
      'definition descriptions are shown correctly'
    );
  });

  test('Fetch extended result and display', async function(assert) {
    assert.expect(3);
    const data = [
      {
        id: 'pageViews',
        name: 'Page Views',
        extended: Promise.resolve({
          id: 'pageViews',
          name: 'Page Views',
          description: 'The number of views of a page.'
        })
      }
    ];
    set(this, 'data', data);

    await render(hbs`<NaviSearchResult::Definition @data={{this.data}} />`);

    assert.dom('.navi-search-definition-result').exists({ count: 1 }, 'One result is displayed');

    assert.deepEqual(
      findAll('.navi-search-definition-result__item-name').map(el => el.textContent.trim()),
      ['Page Views'],
      'definition titles are shown correctly'
    );
    assert.deepEqual(
      findAll('.navi-search-definition-result__item-description').map(el => el.textContent.trim()),
      ['The number of views of a page.'],
      'definition descriptions are shown correctly'
    );
  });

  test('Multiple datasources', async function(assert) {
    assert.expect(4);

    const data = [
      {
        id: 'pageViews',
        name: 'Page Views',
        description: 'The number of views of a page.',
        source: 'bardOne'
      },
      {
        id: 'impressions',
        name: 'Impressions',
        description: 'Number of times a user saw the ad.',
        source: 'bardTwo'
      }
    ];
    set(this, 'data', data);

    await render(hbs`<NaviSearchResult::Definition @data={{this.data}} />`);

    assert.dom('.navi-search-definition-result').exists({ count: 2 }, 'Two results are displayed');

    assert.deepEqual(
      findAll('.navi-search-definition-result__item-name').map(el => el.textContent.trim()),
      ['Page Views', 'Impressions'],
      'definition titles are shown correctly'
    );
    assert.deepEqual(
      findAll('.navi-search-definition-result__item-description').map(el => el.textContent.trim()),
      ['The number of views of a page.', 'Number of times a user saw the ad.'],
      'definition descriptions are shown correctly'
    );
    assert.deepEqual(
      findAll('.navi-search-definition-result__item-source').map(el => el.textContent.trim()),
      ['Source: bardOne', 'Source: bardTwo'],
      'definitions sources are shown correctly'
    );
  });

  test('result without a description', async function(assert) {
    assert.expect(1);

    const data = [
      {
        id: 'pageViews',
        name: 'Page Views'
      }
    ];
    set(this, 'data', data);

    await render(hbs`<NaviSearchResult::Definition @data={{this.data}} />`);
    assert.dom('.navi-search-definition-result').doesNotExist('No results are displayed');
  });

  test('result without a description in extended', async function(assert) {
    assert.expect(1);

    const data = [
      {
        id: 'pageViews',
        name: 'Page Views',
        extended: Promise.resolve({
          id: 'pageViews',
          name: 'Page Views'
        })
      }
    ];
    set(this, 'data', data);

    await render(hbs`<NaviSearchResult::Definition @data={{this.data}} />`);
    assert.dom('.navi-search-definition-result').doesNotExist('No results are displayed');
  });

  test('show more results', async function(assert) {
    assert.expect(12);
    const data = [
      {
        id: 'pageViews',
        name: 'Page Views',
        description: 'The number of views of a page.'
      },
      {
        id: 'impressions',
        name: 'Impressions',
        description: 'Number of times a user saw the ad.'
      },
      {
        id: 'revenue',
        name: 'Revenue',
        description: 'How much money were made.'
      }
    ];
    set(this, 'data', data);

    await render(hbs`<NaviSearchResult::Definition @data={{this.data}} />`);

    assert.dom('.navi-search-definition-result').exists({ count: 2 }, 'Two results are displayed');
    assert.dom('.navi-search-result-options__show-button').hasText('Show more', 'Show more button is shown.');

    assert.deepEqual(
      findAll('.navi-search-definition-result__item-name').map(el => el.textContent.trim()),
      ['Page Views', 'Impressions'],
      'definition titles are shown correctly'
    );
    assert.deepEqual(
      findAll('.navi-search-definition-result__item-description').map(el => el.textContent.trim()),
      ['The number of views of a page.', 'Number of times a user saw the ad.'],
      'definition descriptions are shown correctly'
    );

    await click('.navi-search-result-options__show-button');

    assert.dom('.navi-search-definition-result').exists({ count: 3 }, 'Three results are displayed');
    assert.dom('.navi-search-result-options__show-button').hasText('Show less', 'Show less button is shown.');

    assert.deepEqual(
      findAll('.navi-search-definition-result__item-name').map(el => el.textContent.trim()),
      ['Page Views', 'Impressions', 'Revenue'],
      'definition titles are shown correctly'
    );
    assert.deepEqual(
      findAll('.navi-search-definition-result__item-description').map(el => el.textContent.trim()),
      ['The number of views of a page.', 'Number of times a user saw the ad.', 'How much money were made.'],
      'definition descriptions are shown correctly'
    );

    await click('.navi-search-result-options__show-button');

    assert.dom('.navi-search-definition-result').exists({ count: 2 }, 'Two results are displayed');
    assert.dom('.navi-search-result-options__show-button').hasText('Show more', 'Show more button is shown.');

    assert.deepEqual(
      findAll('.navi-search-definition-result__item-name').map(el => el.textContent.trim()),
      ['Page Views', 'Impressions'],
      'definition titles are shown correctly'
    );
    assert.deepEqual(
      findAll('.navi-search-definition-result__item-description').map(el => el.textContent.trim()),
      ['The number of views of a page.', 'Number of times a user saw the ad.'],
      'definition descriptions are shown correctly'
    );
  });

  test('few returned results', async function(assert) {
    assert.expect(2);
    const data = [
      {
        id: 'pageViews',
        name: 'Page Views',
        description: 'The number of views of a page.'
      }
    ];
    set(this, 'data', data);

    await render(hbs`<NaviSearchResult::Definition @data={{this.data}} />`);
    assert.dom('.navi-search-definition-result').exists({ count: 1 }, 'One result is displayed');
    assert
      .dom('.navi-search-defition-options__button')
      .doesNotExist('Show more button is not displayed when there are few results');
  });
});
