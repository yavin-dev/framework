import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

const ITEMS = [1, 2, 3, 4, 5, 6, 7, 8];

module('Unit | Component | Paginated Scroll List', function(hooks) {
  setupTest(hooks);

  test('_appendPaginatedResults', function(assert) {
    assert.expect(6);

    let component = this.owner.factoryFor('component:paginated-scroll-list').create({
      perPage: 3,
      trim: false,
      items: ITEMS,
      _setItemsExceedMaxHt: () => {} //Suppress hook
    });

    assert.equal(get(component, '_page'), 0, 'page number is 0 initially');

    assert.deepEqual(get(component, '_itemsToRender'), [1, 2, 3], '_itemsToRender array has 3 records initially');

    component._appendPaginatedResults();

    assert.equal(get(component, '_page'), 1, '_appendPaginatedResults increments page number to 1 as expected');

    assert.deepEqual(
      get(component, '_itemsToRender'),
      [1, 2, 3, 4, 5, 6],
      '_appendPaginatedResults appends page 1 content to _itemsToRender array as expected'
    );

    component._appendPaginatedResults();

    assert.equal(get(component, '_page'), 2, '_appendPaginatedResults increments page number to 2 as expected');

    assert.deepEqual(
      get(component, '_itemsToRender'),
      ITEMS,
      '_appendPaginatedResults appends page 2 content to _itemsToRender array as expected'
    );
  });
});
