import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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
    </style>
    <PaginatedScrollList @items={{this.items}} as |item|>
        <div class='mock-item'>{{item.foo}}</div>
    </PaginatedScrollList>
`;

module('Integration | Component | paginated scroll list', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('showMoreAction', () => {});
  });

  test('component is rendered', async function (assert) {
    assert.expect(1);

    this.set('items', _buildItemsArray(2, 'This is Foo Object'));
    await render(COMMON_TEMPLATE);

    assert.dom('.items-container').exists('Component renders');
  });

  // Builds a mock  array of items object in the form [{foo: content}, {foo: content}, ...]
  function _buildItemsArray(numberOfItems, content) {
    let items = [];

    for (let i = 0; i < numberOfItems; i++) {
      items.push({
        foo: content,
      });
    }
    return A(items);
  }
});
