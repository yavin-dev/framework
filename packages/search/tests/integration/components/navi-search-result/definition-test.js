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
    assert.expect(5);

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
    const result = {
      component: 'navi-search-result/definition',
      title: 'Definitions',
      data
    };
    set(this, 'result', result);

    await render(hbs`<NaviSearchResult::Definition @data={{this.result.data}} />`);

    assert.dom('.navi-search-result__definition.result_element').exists({ count: 2 }, 'Two results are displayed');
    const definitionTitles = findAll('.navi-search-result__definition-name').map(el => el.textContent.trim());
    const definitionDescription = findAll('.navi-search-result__definition-description').map(el => el.textContent.trim());
    const expectedDefinitionTitles = ['Page Views', 'Impressions'];
    const expectedDefinitionDescriptions = ['The number of views of a page.', 'Number of times a user saw the ad.'];

    assert.deepEqual(definitionTitles, expectedDefinitionTitles, 'definition titles are shown correctly');
    assert.deepEqual(definitionDescriptions, expectedDefinitionDescriptions, 'definition descriptions are shown correctly');
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
    const result = {
      component: 'navi-search-result/definition',
      title: 'Definitions',
      data
    };
    set(this, 'result', result);

    await render(hbs`<NaviSearchResult::Definition @data={{this.result.data}} />`);

    assert.dom('.navi-search-result__definition.result_element').exists({ count: 1 }, 'One result is displayed');

    const definitionTitles = findAll('.navi-search-result__definition-name').map(el => el.textContent.trim());
    const definitionDescription = findAll('.navi-search-result__definition-description').map(el => el.textContent.trim());
    const expectedDefinitionTitles = ['Page Views',];
    const expectedDefinitionDescriptions = ['The number of views of a page.'];
    assert.deepEqual(definitionTitles, expectedDefinitionTitles, 'definition titles are shown correctly');
    assert.deepEqual(definitionDescriptions, expectedDefinitionDescriptions, 'definition descriptions are shown correctly');
    );
  });
});
