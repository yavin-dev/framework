import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import $ from 'jquery';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { clickItemFilter } from 'navi-reports/test-support/report-builder';

module('Acceptance | date filter', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('date filter builder', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await clickItemFilter('dimension', 'User Signup Date');

    assert.ok(
      !!$('.filter-builder__operator:contains(Since)').length,
      'The date dimension filter builder is used for a dimension with date values'
    );

    await click('.filter-collection__remove');
    await clickItemFilter('dimension', 'User Region');

    assert.ok(
      !!$('.filter-builder-dimension__operator:contains(Equals)').length,
      'The normal dimension filter builder is used for a dimension with non-date values'
    );
  });

  test('dimension date range filter keeps values after save', async function(assert) {
    assert.expect(5);

    await visit('/reports/1/view');
    await clickItemFilter('dimension', 'User Signup Date');
    await click($('.filter-builder__operator:contains(Since) .filter-builder__select-trigger')[0]);
    await click($('li.ember-power-select-option:contains(Between)')[0]);

    assert.ok(!!$('.filter-builder__operator:contains(Between)').length, 'Between is the selected operator');

    //Set low value
    await clickTrigger('.filter-values--dimension-date-range-input__low-value .ember-basic-dropdown-trigger');
    await click($('button.ember-power-calendar-day--current-month:contains(4)')[0]);

    //Set high value
    await clickTrigger('.filter-values--dimension-date-range-input__high-value .ember-basic-dropdown-trigger');
    await click($('button.ember-power-calendar-day--current-month:contains(5)')[0]);

    assert
      .dom('.filter-values--dimension-date-range-input__low-value .dropdown-date-picker__trigger')
      .includesText('04,', 'The low value is set');
    assert
      .dom('.filter-values--dimension-date-range-input__high-value .dropdown-date-picker__trigger')
      .includesText('05,', 'The high value is set');

    await click('.navi-report__save-btn');

    assert
      .dom('.filter-values--dimension-date-range-input__low-value .dropdown-date-picker__trigger')
      .includesText('04,', 'The low value is still set after the report is saved');

    assert
      .dom('.filter-values--dimension-date-range-input__high-value .dropdown-date-picker__trigger')
      .includesText('05,', 'The high value is still set after the report is saved');
  });

  test('verify the different time grains work as expected', async function(assert) {
    await visit('/reports/1/view');

    assert.ok(!!$('.grouped-list__item:contains(Day)').length, 'Day is the default selected time grain');
    assert.ok(
      !!$('.filter-builder__operator:contains(Between)').length,
      'Between is the default selected filter builder operator'
    );

    const timeGrains = ['Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year'];
    const grain = 'Year';

    for (const grain of timeGrains) {
      await click($(`.grouped-list__item:contains(${grain})`)[0]);
      assert.ok(
        !!$('.filter-builder__operator:contains(Between)').length,
        'Between is the selected filter builder operator'
      );

      //Set low value
      await clickTrigger('.filter-values--date-range-input__low-value .ember-basic-dropdown-trigger');
      await click($('button.ember-power-calendar-day--current-month:contains(4)')[0]);

      //Set high value
      await clickTrigger('.filter-values--date-range-input__high-value .ember-basic-dropdown-trigger');
      await click($('button.ember-power-calendar-day--current-month:contains(5)')[0]);

      assert
        .dom('.filter-values--date-range-input__low-value .dropdown-date-picker__trigger')
        .includesText('04,', 'The low value is set');
      assert
        .dom('.filter-values--date-range-input__high-value .dropdown-date-picker__trigger')
        .includesText('05,', 'The high value is set');

      await click($('.filter-builder__operator:contains(Between) .filter-builder__select-trigger')[0]);
      await click($('li.ember-power-select-option:contains(Current)')[0]);
      assert.ok(
        !!$('.filter-builder__operator:contains(Current)').length,
        'Current is the selected filter builder operator'
      );

      await click($('.filter-builder__operator:contains(Current) .filter-builder__select-trigger')[0]);
      await click($('li.ember-power-select-option:contains(In The Past)')[0]);
      assert.ok(
        !!$('.filter-builder__operator:contains(In The Past)').length,
        'In the Past is the selected filter builder operator'
      );
    }
  });
});
