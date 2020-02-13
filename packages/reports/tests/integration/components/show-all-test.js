import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, click } from '@ember/test-helpers';
import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';

const COMMON_TEMPLATE = hbs`
    <style>
        .show-all {
            max-height: 40px;
        }
    </style>
    {{show-all
        filter=filter
        updateFilterValues=(action updateFilterValues)
        cancel=(action cancel)
    }}`;

let Filter = {
  dimension: {
    longName: 'property'
  },
  values: _buildFilterVals(10)
};

module('Integration | Component | Show All', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('filter', Filter);
    this.set('updateFilterValues', () => {});
    this.set('cancel', () => {});
  });

  test('show-all component renders', async function(assert) {
    assert.expect(5);

    await render(COMMON_TEMPLATE);

    assert
      .dom('.navi-modal-header .primary-header')
      .hasText('Included properties', 'component has main header text based on dimension filter');

    assert
      .dom('.navi-modal-header .secondary-header')
      .hasText(
        'The properties listed below have been included',
        'component has secondary header text based on dimension filter'
      );

    assert.equal(
      find('.show-all .valid-id-count')
        .textContent.replace(/\s+/g, ' ')
        .trim(),
      '10 properties',
      'component displays appropriate filter value count'
    );

    let pills = findAll('.show-all .item'),
      expectedResult = Filter.values.map(value => {
        return `${value.get('description')} (${value.get('id')})`;
      });

    assert.deepEqual(
      pills.map(pill => pill.childNodes[0].wholeText.trim()),
      expectedResult,
      'component displays appropriate filter values as expected'
    );

    assert.dom('.show-all .btn').hasText('Done', 'component displays "Done" button when no values have been removed');
  });

  test('behavior of done button', async function(assert) {
    assert.expect(3);

    await render(COMMON_TEMPLATE);

    assert.ok($('button:contains("Done")').is(':visible'), 'Done button is visible before updating filter values');

    this.set('cancel', () => {
      assert.ok(true, 'cancelAction action is triggered');
    });

    await click($('button:contains("Done")')[0]);

    /* == update filter values == */
    await click($('.show-all li:first span')[0]); // remove 1st pill

    assert.notOk(
      $('button:contains("Done")').is(':visible'),
      'Done button is not visible after removing filter values'
    );
  });

  test('behavior of cancel button', async function(assert) {
    assert.expect(3);

    await render(COMMON_TEMPLATE);

    assert.notOk(
      $('button:contains("Cancel")').is(':visible'),
      'Cancel button is not visible before updating filter values'
    );

    /* == update filter values == */
    await click($('.show-all .item:first .remove-pill')[0]); // remove 1st pill

    assert.ok($('button:contains("Cancel")').is(':visible'), 'Cancel button is visible after updating filter values');

    this.set('cancel', () => {
      assert.ok(true, 'cancelAction action is triggered');
    });

    await click($('button:contains("Cancel")')[0]);
  });

  test('updating filter values', async function(assert) {
    assert.expect(6);

    await render(COMMON_TEMPLATE);

    assert.notOk(
      $('button:contains("Update")').is(':visible'),
      'Update button is not visible before updating filter values'
    );

    assert.dom('.items-count').hasText('10', 'component displays 10 filter values before updating filter values');

    /* == update filter values == */
    await click($('.show-all .item:first .remove-pill')[0]); // remove 1st pill

    assert.ok($('button:contains("Update")').is(':visible'), 'Update button is visible after updating filter values');

    assert.dom('.items-count').hasText('9', 'component displays 9 filter values after updating filter values');

    this.set('updateFilterValues', updatedValues => {
      assert.ok(true, 'update filter values action is triggered');

      assert.deepEqual(
        updatedValues,
        Filter.values.slice(1),
        'update filter values action receives updated values as expected'
      );
    });

    await click($('button:contains("Update")')[0]);
  });
});

//Builds mock array of filter values
function _buildFilterVals(count) {
  let values = A([]);
  for (let i = 0; i < count; i++) {
    values.push(
      EmberObject.create({
        id: i.toString(),
        description: 'Property ' + i
      })
    );
  }
  return values;
}
