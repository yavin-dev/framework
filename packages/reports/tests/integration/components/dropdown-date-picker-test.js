import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import $ from 'jquery';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import Moment from 'moment';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dropdown date picker', function(hooks) {
  setupRenderingTest(hooks);

  test('dropdown-date-picker', async function(assert) {
    assert.expect(5);

    this.set('savedDate', '2018-12-25');
    this.set('actions', {
      onUpdate(date) {
        const clickedDate = Moment(date).format('YYYY-MM-DD');
        assert.equal(clickedDate, '2018-12-24', 'The current selected date is sent to the onUpdate action');
        this.set('savedDate', clickedDate);
      }
    });

    await render(hbs`
      {{#dropdown-date-picker
        dateTimePeriod="day"
        date=(moment savedDate)
        onUpdate=(action 'onUpdate')
      }}
        Dropdown Trigger
      {{/dropdown-date-picker}}
    `);

    assert.dom('.dropdown-date-picker__trigger').hasText('Dropdown Trigger', 'Trigger is displayed');

    await clickTrigger('.dropdown-date-picker__trigger');

    assert.dom('.navi-date-picker-day').isVisible('The day time grain date picker is shown when the dropdown is open');

    assert
      .dom('.ember-power-calendar-day--selected')
      .hasText('25', 'The saved date is passed to the date picker as the selected date');

    await click($('.ember-power-calendar-day--current-month:contains(24)')[0]);
    await clickTrigger('.dropdown-date-picker__trigger');

    assert.dom('.ember-power-calendar-day--selected').hasText('24', 'The selected date changed');
  });
});
