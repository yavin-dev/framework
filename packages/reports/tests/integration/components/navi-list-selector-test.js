import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { fillInSync } from '../../helpers/fill-in-sync';

moduleForComponent('navi-list-selector', 'Integration | Component | navi list selector', {
  integration: true,
  beforeEach() {
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

    this.render(hbs`
          {{#navi-list-selector
              title='Items'
              items=items
              searchField='field'
              selected=selected
              as | items areItemsFiltered |
          }}
              {{#each items as | item |}}
                  <li class='test-item {{if areItemsFiltered 'test-item__filtered'}}'>
                    {{item.field}}
                  </li>
              {{/each}}
          {{/navi-list-selector}}
      `);
  }
});

test('it renders', function(assert) {
  assert.expect(5);

  assert.ok(this.$('.navi-list-selector').is(':visible'), 'The navi-list-selector component is rendered');

  assert.equal(
    this.$('.navi-list-selector__title')
      .text()
      .trim(),
    'Items',
    'The navi-list-selector component renders a title'
  );

  assert.equal(
    this.$('.navi-list-selector__search-input').attr('placeholder'),
    'Search Items',
    'The navi-list-selector search bar has the title in the placeholder'
  );

  assert.ok(
    this.$('.navi-list-selector__show-link').is(':visible'),
    'The navi-list-selector`s show all/show selected link is rendered'
  );

  assert.ok(this.$('.navi-list-selector__search').is(':visible'), 'The navi-list-selector`s search bar is rendered');
});

test('show all/show selected', function(assert) {
  assert.expect(8);

  assert.equal(
    this.$('.navi-list-selector__show-link')
      .text()
      .trim(),
    'Show Selected (1)',
    'the show link initially has the text `Show Selected`'
  );

  assert.ok(
    isEmpty(this.$('.test-item__filtered')),
    'the boolean `areItemsFiltered` is falsy when the item list is unfiltered'
  );

  assert.deepEqual(
    this.$('.test-item')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['foo', 'bar', 'baz'],
    'All the items are rendered as list-item initially'
  );

  run(() => {
    this.$('.navi-list-selector__show-link').click();
  });

  assert.equal(
    this.$('.navi-list-selector__show-link')
      .text()
      .trim(),
    'Show All',
    'the show link text is toggled to `Show All` when clicked'
  );

  assert.deepEqual(
    this.$('.test-item')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['foo'],
    'Only the selected items are rendered as `list-item`s'
  );

  assert.deepEqual(
    this.$('.test-item__filtered')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['foo'],
    'the boolean `areItemsFiltered` is true when item list is filtered'
  );

  this.set('selected', []);
  assert.equal(
    this.$('.navi-list-selector__show-link')
      .text()
      .trim(),
    'Show Selected (0)',
    'the show link will be change to "Show Selected"'
  );

  run(() => {
    this.$('.navi-list-selector__show-link').click();
  });
  assert.equal(
    this.$('.navi-list-selector__content--error')
      .text()
      .trim(),
    'No items selected',
    'No items selected error message is displayed when no items are selected'
  );
});

test('search', function(assert) {
  assert.expect(5);

  run(() => {
    fillInSync('.navi-list-selector__search-input', 'ba');
  });

  assert.deepEqual(
    this.$('.test-item')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['bar', 'baz'],
    'the items that match the search query are rendered as `list-item`s'
  );

  run(() => {
    this.$('.navi-list-selector__show-link').click();
  });

  assert.deepEqual(
    this.$('.test-item')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    [],
    'no items match with the search query in the selected item list'
  );

  assert.equal(
    this.$('.navi-list-selector__content--error')
      .text()
      .trim(),
    'No items found',
    'No items found error message is displayed when no items match the search query'
  );

  run(() => {
    this.$('.navi-list-selector__search-input-clear').click();
  });

  assert.deepEqual(
    this.$('.test-item')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['foo'],
    'the search query is cleared and the selected items are rendered as `list-item`s'
  );

  assert.deepEqual(
    this.$('.test-item__filtered')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['foo'],
    'the boolean `areItemsFiltered` is true when item list is filtered by search query'
  );
});
