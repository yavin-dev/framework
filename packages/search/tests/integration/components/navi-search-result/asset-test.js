import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';

module('Integration | Component | navi-search-result-asset', function(hooks) {
  setupRenderingTest(hooks);

  test('displays results', async function(assert) {
    assert.expect(2);

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
    assert.dom('.navi-search-result-options__show-button').hasText('Show more', 'Show more button is shown.');
    assert.deepEqual(
      findAll('.navi-search-asset-result__item').map(el => el.textContent.trim()),
      ['Revenue report 1', 'Revenue Dashboard 1', 'Revenue report 2', 'Revenue Dashboard 2', 'Revenue report 3'],
      'Displayed correct search result.'
    );

    await click('.navi-search-result-options__show-button');

    assert.dom('.navi-search-asset-result').exists({ count: 6 }, '6 results are displayed');
    assert.dom('.navi-search-result-options__show-button').hasText('Show less', 'Show less button is shown.');
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

    await click('.navi-search-result-options__show-button');

    assert.dom('.navi-search-asset-result').exists({ count: 5 }, '5 results are displayed');
    assert.dom('.navi-search-result-options__show-button').hasText('Show more', 'Show more button is shown.');
    assert.deepEqual(
      findAll('.navi-search-asset-result__item').map(result => result.textContent.trim()),
      ['Revenue report 1', 'Revenue Dashboard 1', 'Revenue report 2', 'Revenue Dashboard 2', 'Revenue report 3'],
      'Displayed correct search result.'
    );
  });
});
