import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import $ from 'jquery';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | date filter', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('date filter builder', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await click($('.grouped-list__group-header:contains(test)')[0]);
    await click($('.grouped-list__item:contains(User Signup Date) .grouped-list__filter')[0]);

    assert.ok(
      !!$('.filter-builder__operator:contains(Since)').length,
      'The date dimension filter builder is used for a dimension with date values'
    );

    await click('.filter-collection__remove');
    await click($('.grouped-list__item:contains(User Region) .grouped-list__filter')[0]);

    assert.ok(
      !!$('.filter-builder-dimension__operator:contains(Equals)').length,
      'The normal dimension filter builder is used for a dimension with non-date values'
    );
  });

  test('dimension date range filter keeps values after save', async function(assert) {
    assert.expect(5);

    await visit('/reports/1/view');
    await click($('.grouped-list__group-header:contains(test)')[0]);
    await click($('.grouped-list__item:contains(User Signup Date) .grouped-list__filter')[0]);
    await click($('.filter-builder__operator:contains(Since) .filter-builder__select-trigger')[0]);
    await click($('li.ember-power-select-option:contains(Between)')[0]);

    assert.ok(!!$('.filter-builder__operator:contains(Between)').length, 'Between is the selected operator');

    //Set low value
    await clickTrigger('.filter-values--dimension-date-range-input__low-value .ember-basic-dropdown-trigger');
    await click($('.dropdown-date-picker__dropdown td.day:not(.old):not(.new):contains(4)')[0]);
    await click('.dropdown-date-picker__apply');

    //Set high value
    await clickTrigger('.filter-values--dimension-date-range-input__high-value .ember-basic-dropdown-trigger');
    await click($('.dropdown-date-picker__dropdown td.day:not(.old):not(.new):contains(5)')[0]);
    await click('.dropdown-date-picker__apply');

    assert.ok(!!$('.filter-values--dimension-date-range-input__low-value:contains(4)').length, 'The low value is set');
    assert.ok(
      !!$('.filter-values--dimension-date-range-input__high-value:contains(9)').length,
      'The high value is set'
    );

    await click('.navi-report__save-btn');

    assert.ok(
      !!$('.filter-values--dimension-date-range-input__low-value:contains(4)').length,
      'The low value is still set after the report is saved'
    );
    assert.ok(
      !!$('.filter-values--dimension-date-range-input__high-value:contains(9)').length,
      'The high value is still set after the report is saved'
    );
  });
});
