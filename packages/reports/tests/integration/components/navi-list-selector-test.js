import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { fillInSync } from '../../helpers/fill-in-sync';
import config from 'ember-get-config';

const TEMPLATE = hbs`
  <NaviListSelector
    @title="Items"
    @items={{this.items}}
    @searchField="field"
    @selected={{this.selected}}
    as | items areItemsFiltered |
  >
    {{#each items as | item |}}
      <li class="test-item {{if areItemsFiltered "test-item__filtered"}}">
        {{item.field}}
      </li>
    {{/each}}
  </NaviListSelector>`;

module('Integration | Component | navi list selector', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.set('items', [
      {
        id: '1',
        field: 'foo'
      },
      {
        id: '2',
        field: 'bar'
      },
      {
        id: '3',
        field: 'baz'
      }
    ]);

    this.set('selected', [
      {
        id: '1',
        field: 'foo'
      }
    ]);
  });

  test('it renders', async function(assert) {
    assert.expect(5);

    await render(TEMPLATE);

    assert.dom('.navi-list-selector').isVisible('The navi-list-selector component is rendered');

    assert.dom('.navi-list-selector__title').hasText('Items', 'The navi-list-selector component renders a title');

    assert
      .dom('.navi-list-selector__search-input')
      .hasAttribute(
        'placeholder',
        'Search Items',
        'The navi-list-selector search bar has the title in the placeholder'
      );

    assert
      .dom('.navi-list-selector__show-link')
      .isVisible('The navi-list-selector`s show all/show selected link is rendered');

    assert.dom('.navi-list-selector__search').isVisible('The navi-list-selector`s search bar is rendered');
  });

  test('show all/show selected', async function(assert) {
    assert.expect(8);

    const originalFeatureFlag = config.navi.FEATURES.enableRequestPreview;

    config.navi.FEATURES.enableRequestPreview = false;

    await render(TEMPLATE);

    assert
      .dom('.navi-list-selector__show-link')
      .hasText('Show Selected (1)', 'the show link initially has the text `Show Selected`');

    assert
      .dom('.test-item__filtered')
      .isNotVisible('the boolean `areItemsFiltered` is falsy when the item list is unfiltered');

    assert.deepEqual(
      findAll('.test-item').map(el => el.textContent.trim()),
      ['foo', 'bar', 'baz'],
      'All the items are rendered as list-item initially'
    );

    await click('.navi-list-selector__show-link');

    assert
      .dom('.navi-list-selector__show-link')
      .hasText('Show All', 'the show link text is toggled to `Show All` when clicked');

    assert.deepEqual(
      findAll('.test-item').map(el => el.textContent.trim()),
      ['foo'],
      'Only the selected items are rendered as `list-item`s'
    );

    assert.deepEqual(
      findAll('.test-item__filtered').map(el => el.textContent.trim()),
      ['foo'],
      'the boolean `areItemsFiltered` is true when item list is filtered'
    );

    this.set('selected', []);
    assert
      .dom('.navi-list-selector__show-link')
      .hasText('Show Selected (0)', 'the show link will be change to "Show Selected"');

    await click('.navi-list-selector__show-link');
    assert
      .dom('.navi-list-selector__content--error')
      .hasText('No items selected', 'No items selected error message is displayed when no items are selected');

    config.navi.FEATURES.enableRequestPreview = originalFeatureFlag;
  });

  test('show all/show selected with enableRequestPreview', async function(assert) {
    assert.expect(1);

    const originalFeatureFlag = config.navi.FEATURES.enableRequestPreview;

    config.navi.FEATURES.enableRequestPreview = true;

    await render(TEMPLATE);

    assert
      .dom('.navi-list-selector__show-link')
      .doesNotExist('Show Selected toggle is hidden if enableRequestPreview flag is turned on');

    config.navi.FEATURES.enableRequestPreview = originalFeatureFlag;
  });

  test('search', async function(assert) {
    assert.expect(5);

    await render(TEMPLATE);

    run(() => {
      fillInSync('.navi-list-selector__search-input', 'ba');
    });

    assert.deepEqual(
      findAll('.test-item').map(el => el.textContent.trim()),
      ['bar', 'baz'],
      'the items that match the search query are rendered as `list-item`s'
    );

    await click('.navi-list-selector__show-link');

    assert.deepEqual(
      findAll('.test-item').map(el => el.textContent.trim()),
      [],
      'no items match with the search query in the selected item list'
    );

    assert
      .dom('.navi-list-selector__content--error')
      .hasText('No items found', 'No items found error message is displayed when no items match the search query');

    await click('.navi-list-selector__search-input-clear');

    assert.deepEqual(
      findAll('.test-item').map(el => el.textContent.trim()),
      ['foo'],
      'the search query is cleared and the selected items are rendered as `list-item`s'
    );

    assert.deepEqual(
      findAll('.test-item__filtered').map(el => el.textContent.trim()),
      ['foo'],
      'the boolean `areItemsFiltered` is true when item list is filtered by search query'
    );
  });
});
