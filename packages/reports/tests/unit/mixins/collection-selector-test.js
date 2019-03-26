import EmberObject from '@ember/object';
import CollectionSelectorMixin from 'navi-reports/mixins/collection-selector';
import { module, test } from 'qunit';

const TABLE_ITEMS = [
  {
    id: 'eid',
    longName: 'EventId'
  },
  {
    id: 'nw',
    longName: 'Network'
  }
];

let CollectionSelector;

module('Unit | Mixin | Collection Selector', function(hooks) {
  hooks.beforeEach(function() {
    CollectionSelector = EmberObject.extend(CollectionSelectorMixin);
  });

  test('Testing initialization of mixin object', function(assert) {
    assert.expect(3);

    assert.throws(
      () => {
        CollectionSelector.create();
      },
      /^Error.*Items array should not be empty$/,
      'Error is thrown when item array is empty'
    );

    assert.throws(
      () => {
        CollectionSelector.create({ items: TABLE_ITEMS.concat(TABLE_ITEMS[1]) });
      },
      /^Error.*Items array should be unique$/,
      'Error is thrown when item array has duplicate values'
    );

    assert.throws(
      () => {
        CollectionSelector.create({
          items: TABLE_ITEMS.concat(TABLE_ITEMS[1]),
          selectedItem: { id: 'foo', longName: 'Foo Name' }
        });
      },
      /^Error.*Items array should be unique$/,
      'Error is thrown when selected item is not present in items array'
    );
  });
});
