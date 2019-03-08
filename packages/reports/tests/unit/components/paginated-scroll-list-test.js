import { get } from '@ember/object';
import { test, moduleForComponent } from 'ember-qunit';

const ITEMS = [1, 2, 3, 4, 5, 6, 7, 8];

moduleForComponent('paginated-scroll-list', 'Unit | Component | Paginated Scroll List', {
  unit: true
});

test('_appendPaginatedResults', function(assert) {
  assert.expect(6);

  let component = this.subject({
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
