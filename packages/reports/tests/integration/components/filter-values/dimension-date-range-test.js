import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { A as arr } from '@ember/array';
import { get } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter values/dimension date range', function(hooks) {
  setupRenderingTest(hooks);

  test('displayed dates and update actions', async function(assert) {
    assert.expect(4);

    this.set('filter', { values: arr([]) });
    this.set('onUpdateFilter', () => null);

    await render(hbs`{{filter-values/dimension-date-range
      filter=filter
      onUpdateFilter=(action onUpdateFilter)
    }}`);

    assert.equal(
      find('*')
        .textContent.replace(/\s\s+/g, ' ')
        .trim(),
      'Since and Before',
      'Appropriate placeholders are displayed when the filter has no dates'
    );

    this.set('filter', { values: arr(['2019-01-05', null]) });

    //Check that setting low value sends the new date value to the action
    this.set('onUpdateFilter', filter => {
      assert.deepEqual(get(filter, 'values'), ['2019-01-12', null], 'Selecting the low date updates the filter');
    });
    clickTrigger('.filter-values--dimension-date-range-input__low-value>.dropdown-date-picker__trigger');
    $('td.day:contains(12)').click();
    $('.dropdown-date-picker__apply').click();

    //Set a high value so that the calendar opens to January 2019 instead of the month that this test is run
    this.set('filter', { values: arr(['2019-01-05', '2019-01-12']) });

    //Check that setting high value sends the new date value to the action
    this.set('onUpdateFilter', filter => {
      assert.deepEqual(
        get(filter, 'values'),
        ['2019-01-05', '2019-01-15'],
        'Selecting the high date updates the filter'
      );
    });
    clickTrigger('.filter-values--dimension-date-range-input__high-value>.dropdown-date-picker__trigger');
    $('td.day:contains(15)').click();
    $('.dropdown-date-picker__apply').click();

    //Check that dates are displayed correctly
    this.set('filter', { values: arr(['2019-01-12', '2019-01-15']) });
    assert.equal(
      find('*')
        .textContent.replace(/\s\s+/g, ' ')
        .trim(),
      'Jan 12, 2019 and Jan 15, 2019',
      'Appropriate dates are displayed when the filter has dates'
    );
  });
});
