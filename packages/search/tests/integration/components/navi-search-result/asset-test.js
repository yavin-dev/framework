import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';

module('Integration | Component | navi-search-result-asset', function(hooks) {
  setupRenderingTest(hooks);

  test('displays results', async function(assert) {
    assert.expect(3);

    const data = [
      {
        title: 'Revenue report 1',
        modelId: 7,
        constructor: {
          modelName: 'report'
        }
      },
      {
        title: 'Revenue Dashboard',
        modelId: 4,
        constructor: {
          modelName: 'dashboard'
        }
      }
    ];
    set(this, 'data', data);
    set(this, 'closeResults', () => undefined);

    await render(hbs`<NaviSearchResult::Asset @data={{this.data}} @closeResults={{fn this.closeResults}} />`);

    assert.dom('.navi-search-asset-result').exists({ count: 2 }, '2 results are displayed');
    assert.deepEqual(
      findAll('.navi-search-asset-result__item').map(result => result.textContent.trim()),
      ['Revenue report 1', 'Revenue Dashboard'],
      'Displayed correct search result.'
    );
    assert
      .dom('.navi-search-defition-options__button')
      .doesNotExist('Show more button is not displayed when there are few results');
  });

  test('show more results', async function(assert) {
    assert.expect(9);

    const data = [
      {
        title: 'Revenue report 1',
        modelId: 7,
        constructor: {
          modelName: 'report'
        }
      },
      {
        title: 'Revenue Dashboard 1',
        modelId: 4,
        constructor: {
          modelName: 'dashboard'
        }
      },
      {
        title: 'Revenue report 2',
        modelId: 7,
        constructor: {
          modelName: 'report'
        }
      },
      {
        title: 'Revenue Dashboard 2',
        modelId: 4,
        constructor: {
          modelName: 'dashboard'
        }
      },
      {
        title: 'Revenue report 3',
        modelId: 7,
        constructor: {
          modelName: 'report'
        }
      },
      {
        title: 'Revenue Dashboard 3',
        modelId: 4,
        constructor: {
          modelName: 'dashboard'
        }
      }
    ];
    set(this, 'data', data);
    set(this, 'closeResults', () => undefined);

    await render(hbs`<NaviSearchResult::Asset @data={{this.data}} @closeResults={{fn this.closeResults}} />`);

    assert.dom('.navi-search-asset-result').exists({ count: 5 }, '5 results are displayed');
    assert.dom('.navi-search-result-options__button').hasText('Show more', 'Show more button is shown.');
    assert.deepEqual(
      findAll('.navi-search-asset-result__item').map(el => el.textContent.trim()),
      ['Revenue report 1', 'Revenue Dashboard 1', 'Revenue report 2', 'Revenue Dashboard 2', 'Revenue report 3'],
      'Displayed correct search result.'
    );

    await click('.navi-search-result-options__button');

    assert.dom('.navi-search-asset-result').exists({ count: 6 }, '6 results are displayed');
    assert.dom('.navi-search-result-options__button').hasText('Show less', 'Show less button is shown.');
    assert.deepEqual(
      findAll('.navi-search-asset-result__item').map(result => result.textContent.trim()),
      [
        'Revenue report 1',
        'Revenue Dashboard 1',
        'Revenue report 2',
        'Revenue Dashboard 2',
        'Revenue report 3',
        'Revenue Dashboard 3'
      ],
      'Displayed correct search result.'
    );

    await click('.navi-search-result-options__button');

    assert.dom('.navi-search-asset-result').exists({ count: 5 }, '5 results are displayed');
    assert.dom('.navi-search-result-options__button').hasText('Show more', 'Show more button is shown.');
    assert.deepEqual(
      findAll('.navi-search-asset-result__item').map(result => result.textContent.trim()),
      ['Revenue report 1', 'Revenue Dashboard 1', 'Revenue report 2', 'Revenue Dashboard 2', 'Revenue report 3'],
      'Displayed correct search result.'
    );
  });
});
