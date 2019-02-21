import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { formatItemDimension } from 'navi-core/helpers/mixed-height-layout';
import cloneDeep from 'lodash/cloneDeep';

const TEMPLATE = hbs`
  <div class="mixed-height-layout-test" style="position:relative;height:50px;width:10px">
    {{#ember-collection items=items estimated-width=10 cell-layout=(mixed-height-layout rowDimensions) as |item|}}
      <div>{{item}}</div>
    {{/ember-collection}}
  </div>`;

module('mixed height layout', function(hooks) {
  setupRenderingTest(hooks);

  test('layout', async function(assert) {
    assert.expect(2);

    let items = [1, 2, 3, 4, 5],
      rowDimensions = items.map(() => formatItemDimension(10));

    this.set('items', items);
    this.set('rowDimensions', rowDimensions);
    await render(TEMPLATE);

    assert.deepEqual(
      findItems(this),
      [
        { height: 10, left: 0, top: 0, width: 10 },
        { height: 10, left: 0, top: 10, width: 10 },
        { height: 10, left: 0, top: 20, width: 10 },
        { height: 10, left: 0, top: 30, width: 10 },
        { height: 10, left: 0, top: 40, width: 10 }
      ],
      'mixed height layout correctly laid out each item'
    );

    //Change first item to have a different height
    let newRowDimensions = cloneDeep(rowDimensions);
    newRowDimensions[0] = formatItemDimension(20);
    this.set('rowDimensions', newRowDimensions);

    assert.deepEqual(
      findItems(this),
      [
        { height: 20, left: 0, top: 0, width: 10 },
        { height: 10, left: 0, top: 20, width: 10 },
        { height: 10, left: 0, top: 30, width: 10 },
        { height: 10, left: 0, top: 40, width: 10 },
        { height: 10, left: 0, top: 50, width: 10 }
      ],
      'mixed height layout correctly laid out each item with mixed heights'
    );
  });

  function findItems(context) {
    // scrollable content rows
    let selector = '.mixed-height-layout-test > div > div > div > div';

    return context
      .$(selector)
      .toArray()
      .map(element => {
        let parentRect = element.parentElement.getBoundingClientRect(),
          elementRect = element.getBoundingClientRect();

        return {
          left: elementRect.left - parentRect.left,
          top: elementRect.top - parentRect.top,
          width: elementRect.width,
          height: elementRect.height
        };
      });
  }
});
