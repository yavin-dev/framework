import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { fillInSync } from '../../helpers/fill-in-sync';

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

    await render(hbs`
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
  });

  test('it renders', function(assert) {
    assert.expect(5);

    assert.ok(this.$('.navi-list-selector').is(':visible'), 'The navi-list-selector component is rendered');

    assert.dom('.navi-list-selector__title').hasText('Items', 'The navi-list-selector component renders a title');

    assert
      .dom('.navi-list-selector__search-input')
      .hasAttribute(
        'placeholder',
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

    assert
      .dom('.navi-list-selector__show-link')
      .hasText('Show Selected (1)', 'the show link initially has the text `Show Selected`');

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

    run(async () => {
      await click('.navi-list-selector__show-link');
    });

    assert
      .dom('.navi-list-selector__show-link')
      .hasText('Show All', 'the show link text is toggled to `Show All` when clicked');

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
    assert
      .dom('.navi-list-selector__show-link')
      .hasText('Show Selected (0)', 'the show link will be change to "Show Selected"');

    run(async () => {
      await click('.navi-list-selector__show-link');
    });
    assert
      .dom('.navi-list-selector__content--error')
      .hasText('No items selected', 'No items selected error message is displayed when no items are selected');
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

    run(async () => {
      await click('.navi-list-selector__show-link');
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

    assert
      .dom('.navi-list-selector__content--error')
      .hasText('No items found', 'No items found error message is displayed when no items match the search query');

    run(async () => {
      await click('.navi-list-selector__search-input-clear');
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
});
