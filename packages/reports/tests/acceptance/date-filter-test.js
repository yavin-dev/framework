import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { findContains } from '../helpers/contains-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | date filter', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('date filter builder', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await click(findContains('.grouped-list__group-header:contains(Test)'));
    await click(findContains('.grouped-list__item:contains(User Signup Date) .checkbox-selector__filter'));

    assert.ok(
      !!findContains('.filter-builder__operator:contains(Since)'),
      'The date dimension filter builder is used for a dimension with date values'
    );

    await click('.filter-collection__remove');
    await click(findContains('.grouped-list__item:contains(User Region) .checkbox-selector__filter'));

    assert.ok(
      !!findContains('.filter-builder__operator:contains(Equals)'),
      'The normal dimension filter builder is used for a dimension with non-date values'
    );
  });

  test('dimension date range filter keeps values after save', async function(assert) {
    assert.expect(5);

    await visit('/reports/1/view');
    await click(findContains('.grouped-list__group-header:contains(Test)'));
    await click(findContains('.grouped-list__item:contains(User Signup Date) .checkbox-selector__filter'));
    await click(findContains('.filter-builder__operator:contains(Since) .filter-builder__select-trigger'));
    await click(findContains('li.ember-power-select-option:contains(Between)'));

    assert.ok(!!findContains('.filter-builder__operator:contains(Between)'), 'Between is the selected operator');

    //Set low value
    await clickTrigger('.filter-values--dimension-date-range-input__low-value .ember-basic-dropdown-trigger');
    await click(findContains('.dropdown-date-picker__dropdown td.day:not(.old):not(.new):contains(4)'));
    await click('.dropdown-date-picker__apply');

    //Set high value
    await clickTrigger('.filter-values--dimension-date-range-input__high-value .ember-basic-dropdown-trigger');
    await click(findContains('.dropdown-date-picker__dropdown td.day:not(.old):not(.new):contains(5)'));
    await click('.dropdown-date-picker__apply');

    assert.ok(
      !!findContains('.filter-values--dimension-date-range-input__low-value:contains(4)'),
      'The low value is set'
    );
    assert.ok(
      !!findContains('.filter-values--dimension-date-range-input__high-value:contains(9)'),
      'The high value is set'
    );

    await click('.navi-report__save-btn');

    assert.ok(
      !!findContains('.filter-values--dimension-date-range-input__low-value:contains(4)'),
      'The low value is still set after the report is saved'
    );
    assert.ok(
      findContains('.filter-values--dimension-date-range-input__high-value:contains(9)'),
      'The high value is still set after the report is saved'
    );
  });
});
