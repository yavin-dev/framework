import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import findByContains from '../helpers/contains-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | date filter', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('date filter builder', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await click(findByContains('.grouped-list__group-header', 'Test'));
    await click(findByContains('.grouped-list__item', 'User Signup Date').querySelector('.checkbox-selector__filter'));

    assert.ok(
      !!findByContains('.filter-builder__operator', 'Since'),
      'The date dimension filter builder is used for a dimension with date values'
    );

    await click('.filter-collection__remove');
    await click(findByContains('.grouped-list__item', 'User Region').querySelector('.checkbox-selector__filter'));

    assert.ok(
      !!findByContains('.filter-builder__operator', 'Equals'),
      'The normal dimension filter builder is used for a dimension with non-date values'
    );
  });

  test('dimension date range filter keeps values after save', async function(assert) {
    assert.expect(5);

    await visit('/reports/1/view');
    await click(findByContains('.grouped-list__group-header', 'Test'));
    await click(findByContains('.grouped-list__item', 'User Signup Date').querySelector('.checkbox-selector__filter'));
    await click(findByContains('.filter-builder__operator', 'Since').querySelector('.filter-builder__select-trigger'));
    await click(findByContains('li.ember-power-select-option', 'Between'));

    assert.ok(!!findByContains('.filter-builder__operator', 'Between'), 'Between is the selected operator');

    //Set low value
    await clickTrigger('.filter-values--dimension-date-range-input__low-value .ember-basic-dropdown-trigger');
    await click(findByContains('.dropdown-date-picker__dropdown td.day:not(.old):not(.new)', '4'));
    await click('.dropdown-date-picker__apply');

    //Set high value
    await clickTrigger('.filter-values--dimension-date-range-input__high-value .ember-basic-dropdown-trigger');
    await click(findByContains('.dropdown-date-picker__dropdown td.day:not(.old):not(.new)', '5'));
    await click('.dropdown-date-picker__apply');

    assert.ok(!!findByContains('.filter-values--dimension-date-range-input__low-value', '4'), 'The low value is set');
    assert.ok(!!findByContains('.filter-values--dimension-date-range-input__high-value', '9'), 'The high value is set');

    await click('.navi-report__save-btn');

    assert.ok(
      !!findByContains('.filter-values--dimension-date-range-input__low-value', '4'),
      'The low value is still set after the report is saved'
    );
    assert.ok(
      findByContains('.filter-values--dimension-date-range-input__high-value', '9'),
      'The high value is still set after the report is saved'
    );
  });
});
