import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const COMMON_TEMPLATE = hbs`
    <style>
        .items-container {
          height: 200px;
          width: 100px;
        }
        .mock-item {
            height: 20px;
        }
        .trimmed {
            max-height: 60px;
            overflow: hidden;
        }
        .show-all {
            max-height: 100px;
            overflow: auto;
        }
    </style>
    {{#paginated-scroll-list
        items=items
        trim=trim
        perPage=perPage
        showMore= (action showMoreAction)
        as |item|
    }}
        <div class='mock-item'>{{item.foo}}</div>
    {{/paginated-scroll-list}}
`;

module('Integration | Component | paginated scroll list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('showMoreAction', () => {});
  });

  test('component is rendered in trimmed mode', async function(assert) {
    assert.expect(4);

    this.set('items', _buildItemsArray(10, 'This is Foo Object'));
    this.set('trim', true);
    this.set('perPage', 250);
    await render(COMMON_TEMPLATE);

    assert.ok(true, 'Component renders');

    assert.dom('.items-container.trimmed').exists({ count: 1 }, 'items container has "trimmed" class');

    assert.equal(
      this.$('a:contains("Show more")').length,
      1,
      'Show more link is visible when rendered items exceed the container max height'
    );

    this.set('items', _buildItemsArray(30, '1'));

    assert.equal(
      this.$('a:contains("Show more")').length,
      1,
      'Show more link is visible when has items not rendered and does not exceed container max height'
    );
  });

  test('component displays more items on clicking show more link', async function(assert) {
    assert.expect(5);

    this.set('items', _buildItemsArray(10, 'This is Foo Object'));
    this.set('trim', true);
    this.set('perPage', 250);

    this.set('showMoreAction', () => {
      assert.ok(false, 'show more action should not be triggered');
    });

    await render(COMMON_TEMPLATE);

    assert.equal(
      this.$('a:contains("Show more")').length,
      1,
      'Show more link is visible before clicking show more link'
    );

    assert
      .dom('.items-container.trimmed')
      .exists({ count: 1 }, 'items container has "trimmed" class before clicking show more link');

    /* == Click Show more link == */
    this.set('showMoreAction', () => {
      assert.ok(true, 'show more action is triggered');
    });

    run(() => {
      this.$('a:contains("Show more")').click();
    });

    assert.equal(
      this.$('a:contains("Show more")').length,
      0,
      'Show more link is not visible after clicking show more link'
    );

    assert
      .dom('.items-container.show-all')
      .exists({ count: 1 }, 'items container has "show-all" class after clicking show more link');
  });

  test('component is rendered in show all state', async function(assert) {
    assert.expect(3);

    this.set('items', _buildItemsArray(2, 'This is Foo Object'));
    this.set('trim', false);
    this.set('perPage', 250);
    await render(COMMON_TEMPLATE);

    assert.ok(true, 'Component renders');

    assert.dom('.items-container.show-all').exists({ count: 1 }, 'items container has "show-all" class');

    assert.equal(this.$('a:contains("Show more")').length, 0, 'Show more link is not visible when trim flag is false');
  });

  test('show more link is not visible when items are within max height', async function(assert) {
    assert.expect(2);

    this.set('items', _buildItemsArray(2, 'This is Foo Object'));
    this.set('trim', true);
    this.set('perPage', 250);
    await render(COMMON_TEMPLATE);

    assert.equal(this.$('a:contains("Show more")').length, 0, 'Show more link is not visible initially');

    /* == items exceed container == */
    this.set('items', _buildItemsArray(4, 'This is Foo Object'));

    assert.equal(this.$('a:contains("Show more")').length, 1, 'Show more link is visible after items change');
  });

  test('scrolling to the bottom loads more elements', async function(assert) {
    assert.expect(2);

    this.set('items', _buildItemsArray(50, 'This is Foo Object'));
    this.set('trim', false);
    this.set('perPage', 25);
    await render(COMMON_TEMPLATE);

    assert.equal($('.mock-item').length, 25, '25 items are shown before scrolling');

    //scroll all the way to the bottom
    this.$('.items-container').scrollTop($('.items-list').height());
    //test can be flaky at times, make sure scroll event happens
    await triggerEvent('.items-container', 'scroll');

    return settled().then(() => {
      assert.dom('.mock-item').exists({ count: 50 }, '50 items are shown after scrolling');
    });
  });

  test('updating items or perPage will cause _itemsToRender to update', async function(assert) {
    assert.expect(4);

    this.set('items', _buildItemsArray(5, 'This is Foo Object'));
    this.set('trim', false);
    this.set('perPage', 250);
    await render(COMMON_TEMPLATE);

    assert.equal($('.item').length, 5, '_itemsToRender is initialized correctly');

    this.set('items', _buildItemsArray(10, 'This is Foo Object'));

    assert.equal($('.item').length, 10, 'updating with new items array causes _itemsToRender to be updated correctly');

    run(() => {
      this.get('items').popObject();
    });

    assert.equal($('.item').length, 9, 'updating existing items array causes _itemsToRender to be updated correctly');

    this.set('perPage', 4);

    assert.equal($('.item').length, 4, 'updating perPage causes _itemsToRender to be updated correctly');
  });

  // Builds a mock  array of items object in the form [{foo: content}, {foo: content}, ...]
  function _buildItemsArray(numberOfItems, content) {
    let items = [];

    for (let i = 0; i < numberOfItems; i++) {
      items.push({
        foo: content
      });
    }
    return A(items);
  }
});
