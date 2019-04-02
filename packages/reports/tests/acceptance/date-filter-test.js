import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | date filter');

test('date filter builder', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');
  click('.grouped-list__group-header:contains(test)');
  click('.grouped-list__item:contains(User Signup Date)>.checkbox-selector__filter');

  andThen(function() {
    assert.ok(
      find('.filter-builder__operator:contains(Since)'),
      'The date dimension filter builder is used for a dimension with date values'
    );

    click('.filter-collection__remove');
    click('.grouped-list__item:contains(User Region)>.checkbox-selector__filter');

    andThen(function() {
      assert.ok(
        find('.filter-builder__operator:contains(Equals)'),
        'The normal dimension filter builder is used for a dimension with non-date values'
      );
    });
  });
});

test('dimension date range filter keeps values after save', async function(assert) {
  assert.expect(5);

  await visit('/reports/1/view');
  await click('.grouped-list__group-header:contains(test)');
  await click('.grouped-list__item:contains(User Signup Date)>.checkbox-selector__filter');
  await click('.filter-builder__operator:contains(Since)>.filter-builder__select-trigger');
  await click('li.ember-power-select-option:contains(Between)');

  assert.ok(find('.filter-builder__operator:contains(Between)'), 'Between is the selected operator');

  //Set low value
  await clickDropdown('.filter-values--dimension-date-range-input__low-value>.dropdown-date-picker__trigger');
  await click('.dropdown-date-picker__dropdown td.day:contains(4):not(.new):not(.old)');
  await click('.dropdown-date-picker__apply');

  //Set high value
  await clickDropdown('.filter-values--dimension-date-range-input__high-value>.dropdown-date-picker__trigger');
  await click('.dropdown-date-picker__dropdown td.day:contains(5):not(.new):not(.old)');
  await click('.dropdown-date-picker__apply');

  assert.ok(find('.filter-values--dimension-date-range-input__low-value:contains(4)'), 'The low value is set');
  assert.ok(find('.filter-values--dimension-date-range-input__high-value:contains(9)'), 'The high value is set');

  await click('.navi-report__save-btn');

  assert.ok(
    find('.filter-values--dimension-date-range-input__low-value:contains(4)'),
    'The low value is still set after the report is saved'
  );
  assert.ok(
    find('.filter-values--dimension-date-range-input__high-value:contains(9)'),
    'The high value is still set after the report is saved'
  );
});
