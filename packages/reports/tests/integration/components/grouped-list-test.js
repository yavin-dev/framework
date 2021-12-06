import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | grouped list', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('items', [
      { val: 1, field: 'foo,bar' },
      { val: 6, field: 'bar' },
      { val: 2, field: 'foo' },
      { val: 3, field: 'foo,bar' },
      { val: 4 },
      { val: 5, field: null },
    ]);

    this.set('sortmeV1', [
      { name: 'ice cream stand', cat: 'places' },
      { name: 'zebra', cat: 'animals' },
      { name: 'zoo', cat: 'places' },
      { name: 'aardvark', cat: 'animals' },
      { name: 'bees', cat: 'animals' },
      { name: 'apple stand', cat: 'places' },
    ]);

    this.set('sortmeV2', [
      { name: 'bop', cat: 'onomatopoeia' },
      { name: 'thwack', cat: null },
      { name: 'sleep', cat: 'zzz' },
    ]);

    this.set('oneCategory', [
      { name: 'Pikachu', category: 'Pokemon' },
      { name: 'Infernape', category: 'Pokemon' },
      { name: 'Empoleon', category: 'Pokemon' },
      { name: 'Torterra', category: 'Pokemon' },
    ]);
  });

  test('it renders', async function (assert) {
    assert.expect(1);

    await render(hbs`<GroupedList @containerSelector="body" />`);

    assert.dom('.grouped-list').exists('the grouped-list component is rendered');
  });

  test('groups', async function (assert) {
    assert.expect(4);

    await render(hbs`
      <GroupedList
        @items={{this.items}}
        @shouldOpenAllGroups={{this.shouldOpenAllGroups}}
        @groupByField="field"
        @containerSelector="body"
        @shouldSort={{true}}
        as | item |
      >
        {{item.val}}
      </GroupedList>
    `);

    const groups = findAll('.grouped-list__group-header-content');
    assert.deepEqual(
      groups.map((el) => el.textContent.trim()),
      ['bar (1)', 'foo (3)', 'Uncategorized (2)'],
      'the groups in the grouped-list are rendered, only the first item in the groupByField is considered for grouping'
    );

    assert.dom(groups[1]).hasText('foo (3)', 'the second group header is `foo(3)`');

    await click(groups[1]);
    assert.deepEqual(
      findAll('.grouped-list__item').map((el) => el.textContent.trim()),
      ['1', '2', '3'],
      'the items under the second group header belong to the group'
    );

    this.set('shouldOpenAllGroups', true);
    // changing shouldOpenAllGroups causes vertical collection render so we need to wait
    await settled();

    assert.deepEqual(
      findAll('.grouped-list li').map((el) => el.textContent.trim()),
      ['bar (1)', '6', 'foo (3)', '1', '2', '3', 'Uncategorized (2)', '4', '5'],
      'All groups are open when `shouldOpenAllGroups` attribute is true'
    );
  });

  test('groups are not sorted when @shouldSort is false', async function (assert) {
    assert.expect(3);

    await render(hbs`
      <GroupedList
        @items={{this.items}}
        @shouldOpenAllGroups={{this.shouldOpenAllGroups}}
        @groupByField="field"
        @containerSelector="body"
        @shouldSort={{false}}
        as | item |
      >
        {{item.val}}
      </GroupedList>
    `);

    const groups = findAll('.grouped-list__group-header-content');
    assert.deepEqual(
      groups.map((el) => el.textContent.trim()),
      ['foo (3)', 'bar (1)', 'Uncategorized (2)'],
      'the groups are in expected order when @shouldSort is false'
    );

    assert.dom(groups[1]).hasText('bar (1)', 'the second group header is `bar (1)`');

    this.set('shouldOpenAllGroups', true);
    // changing shouldOpenAllGroups causes vertical collection render so we need to wait
    await settled();

    assert.deepEqual(
      findAll('.grouped-list li').map((el) => el.textContent.trim()),
      ['foo (3)', '1', '2', '3', 'bar (1)', '6', 'Uncategorized (2)', '4', '5'],
      'All groups are open when `shouldOpenAllGroups` attribute is true'
    );
  });

  test('groups are sorted by sortByField', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <GroupedList
        @items={{this.sortmeV1}}
        @shouldOpenAllGroups={{true}}
        @containerSelector="body"
        @groupByField="cat"
        @sortByField="name"
        @shouldSort={{true}}
        as | item |
      >
        {{item.name}}
      </GroupedList>
    `);

    const allItems = findAll('.grouped-list li');
    assert.deepEqual(
      allItems.map((el) => el.textContent.trim()),
      ['animals (3)', 'aardvark', 'bees', 'zebra', 'places (3)', 'apple stand', 'ice cream stand', 'zoo'],
      "The 'places' and 'animals' groups are sorted by the `sortByField`"
    );
  });

  test('categories are sorted alphabetically', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <GroupedList
        @items={{this.sortmeV2}}
        @shouldOpenAllGroups={{false}}
        @containerSelector="body"
        @groupByField="cat"
        @sortByField="name"
        @shouldSort={{true}}
        as | item |
      >
        {{item.name}}
      </GroupedList>
    `);

    const allItems = findAll('.grouped-list li');
    assert.deepEqual(
      allItems.map((el) => el.textContent.trim()),
      ['onomatopoeia (1)', 'zzz (1)', 'Uncategorized (1)'],
      "The categories are sorted alphabetically with 'Uncategorized' last"
    );
  });

  test('all items are in one category', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <GroupedList
        @items={{this.oneCategory}}
        @shouldOpenAllGroups={{false}}
        @containerSelector="body"
        @groupByField="category"
        @sortByField="name"
        @isSingleCategory="true"
        @shouldSort={{true}}
        as | item |
      >
        {{item.name}}
      </GroupedList>
    `);

    const allItems = findAll('.grouped-list li');
    assert
      .dom('.grouped-list__group-header')
      .doesNotExist('no category header is shown when all items are one category');
    assert.deepEqual(
      allItems.map((ele) => ele.textContent.trim()),
      ['Empoleon', 'Infernape', 'Pikachu', 'Torterra'],
      'all items are displayed without header'
    );
  });
});
