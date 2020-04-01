import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';

module('Integration | Component | definition', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);

    await render(hbs`<NaviSearchResult::Definition />`);

    assert.equal(this.element.textContent.trim(), '');
  });

  test('displays results', async function(assert) {
    assert.expect(2);

    const data = [
      {
        name: 'pageViews',
        longName: 'Page Views',
        description: 'The number of views of a page.'
      },
      {
        name: 'impressions',
        longName: 'Impressions',
        description: 'Number of times a user saw the ad.'
      }
    ];
    const result = {
      component: 'navi-search-result/definition',
      title: 'Definitions',
      data
    };
    set(this, 'result', result);

    await render(hbs`<NaviSearchResult::Definition @data={{this.result.data}} />`);

    assert.dom('td').exists({ count: 2 });
    const results = findAll('td');
    const expectedResults = [
      ['Page Views', 'The number of views of a page.'],
      ['Impressions', 'Number of times a user saw the ad.']
    ];
    assert.deepEqual(
      results.map(result => result.textContent.trim().split(/[\n ][ ]+/)),
      expectedResults,
      'Displayed correct search result.'
    );
  });
});
