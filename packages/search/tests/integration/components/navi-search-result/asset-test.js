import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';

module('Integration | Component | navi-search-result-asset', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);

    await render(hbs`<NaviSearchResult::Asset />`);

    assert.equal(this.element.textContent.trim(), '');
  });

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
        title: 'Revenue Dashboard',
        modelId: 4,
        constructor: {
          modelName: 'dashboard'
        }
      }
    ];
    const result = {
      component: 'navi-search-result/asset',
      title: 'Reports & Dashboards',
      data
    };
    set(this, 'result', result);

    await render(hbs`<NaviSearchResult::Asset @data={{this.result.data}}/>`);

    assert.dom('.navi-search-result__asset.result_element').exists({ count: 2 }, '2 results are displayed');
    let results = findAll('.navi-search-result__asset.result_element');
    let expectedResults = ['Revenue report 1', 'Revenue Dashboard'];
    assert.deepEqual(
      results.map(result => result.textContent.trim()),
      expectedResults,
      'Displayed correct search result.'
    );
  });
});
