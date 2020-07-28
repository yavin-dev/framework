import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | grouped list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('items', [
      { val: 1, field: 'foo,bar' },
      { val: 6, field: 'bar' },
      { val: 2, field: 'foo' },
      { val: 3, field: 'foo,bar' },
      { val: 4 },
      { val: 5, field: null }
    ]);

    this.set('sortme', [
      { name: 'ice cream stand', cat: 'places' },
      { name: 'zebra', cat: 'animals' },
      { name: 'zoo', cat: 'places' },
      { name: 'aardvark', cat: 'animals' },
      { name: 'bees', cat: 'animals' },
      { name: 'apple stand', cat: 'places' }
    ]);
  });

  test('it renders', async function(assert) {
    assert.expect(1);

    await render(hbs`<GroupedList @containerSelector="body" />`);

    assert.dom('.grouped-list').exists('the grouped-list component is rendered');
  });

  test('groups', async function(assert) {
    assert.expect(4);

    await render(hbs`
      <GroupedList
        @items={{this.items}}
        @shouldOpenAllGroups={{this.shouldOpenAllGroups}}
        @groupByField="field"
        @containerSelector="body"
        as | item |
      >
        {{item.val}}
      </GroupedList>
    `);

    const groups = findAll('.grouped-list__group-header-content');
    assert.deepEqual(
      groups.map(el => el.textContent.trim()),
      ['foo (3)', 'bar (1)', 'Uncategorized (2)'],
      'the groups in the grouped-list are rendered, only the first item in the groupByField is considered for grouping'
    );

    assert.dom(groups[0]).hasText('foo (3)', 'the first group header is `foo(3)`');

    await click(groups[0]);
    assert.deepEqual(
      findAll('.grouped-list__item').map(el => el.textContent.trim()),
      ['1', '2', '3'],
      'the items under the first group header belong to the group'
    );

    this.set('shouldOpenAllGroups', true);
    // changing shouldOpenAllGroups causes vertical collection render so we need to wait
    await settled();

    assert.deepEqual(
      findAll('.grouped-list li').map(el => el.textContent.trim()),
      ['foo (3)', '1', '2', '3', 'bar (1)', '6', 'Uncategorized (2)', '4', '5'],
      'All groups are open when `shouldOpenAllGroups` attribute is true'
    );
  });

  test('sorted groups', async function(assert) {
    assert.expect(1);

    await render(hbs`
      <GroupedList
        @items={{this.sortme}}
        @shouldOpenAllGroups={{true}}
        @containerSelector="body"
        @groupByField="cat"
        @sortByField="name"
        as | item |
      >
        {{item.name}}
      </GroupedList>
    `);

    const allItems = findAll('.grouped-list li');
    assert.deepEqual(
      allItems.map(el => el.textContent.trim()),
      ['places (3)', 'apple stand', 'ice cream stand', 'zoo', 'animals (3)', 'aardvark', 'bees', 'zebra'],
      "The 'places' and 'animals' groups are sorted by the `sortByField`"
    );
  });
});
