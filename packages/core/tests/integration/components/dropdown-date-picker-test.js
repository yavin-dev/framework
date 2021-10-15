import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import moment from 'moment';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dropdown date picker', function (hooks) {
  setupRenderingTest(hooks);

  test('dropdown-date-picker', async function (assert) {
    assert.expect(7);

    this.set('savedDate', moment.utc('2018-12-25'));
    this.set('minDate', moment.utc('2018-12-20'));
    this.set('maxDate', moment.utc('2018-12-30'));
    this.set('onUpdate', (date) => {
      const clickedDate = moment(date).format('YYYY-MM-DD');
      assert.equal(clickedDate, '2018-12-24', 'The current selected date is sent to the onUpdate action');
      this.set('savedDate', moment.utc(date));
    });

    await render(hbs`
      <DropdownDatePicker
        @dateTimePeriod="day"
        @date={{this.savedDate}}
        @minDate={{this.minDate}}
        @maxDate={{this.maxDate}}
        @onUpdate={{this.onUpdate}}
      >
        Dropdown Trigger
      </DropdownDatePicker>
    `);

    assert.dom('.dropdown-date-picker__trigger').hasText('Dropdown Trigger', 'Trigger is displayed');

    await clickTrigger('.dropdown-date-picker__trigger');

    assert.dom('.navi-date-picker-day').isVisible('The day time grain date picker is shown when the dropdown is open');

    assert
      .dom('.ember-power-calendar-day--selected')
      .hasText('25', 'The saved date is passed to the date picker as the selected date');

    assert
      .dom('.ember-power-calendar-day--current-month[data-date="2018-12-19"]')
      .isDisabled('Min date is passed down to the date picker');

    assert
      .dom('.ember-power-calendar-day--current-month[data-date="2018-12-31"]')
      .isDisabled('Max date is passed down to the date picker');

    await click('.ember-power-calendar-day--current-month[data-date="2018-12-24"]');
    await clickTrigger('.dropdown-date-picker__trigger');

    assert.dom('.ember-power-calendar-day--selected').hasText('24', 'The selected date changed');
  });
});
