import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { findAll, visit, click, fillIn, triggerKeyEvent } from '@ember/test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
//@ts-ignore
import { clickTrigger as clickInputTrigger } from 'ember-basic-dropdown/test-support/helpers';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import { clickItemFilter } from 'navi-reports/test-support/report-builder';

module('Acceptance | Dropdown Parameter Picker test', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('verify dropdown parameter picker', async function (assert) {
    await visit('/reports/new');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard One"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Network"]');
    await animationsSettled();

    assert.dom('.dropdown-parameter-picker .chips').hasText('Day', 'Date Time parameter is shown properly upon open');

    await clickTrigger('.dropdown-parameter-picker');
    assert.dom('.dropdown-parameter-picker__dropdown').isVisible('Dropdown is visible after clicking parameter chip');

    assert.deepEqual(
      findAll('.dropdown-parameter-picker__dropdown .ember-power-select-group-name').map((el) =>
        el.textContent?.trim()
      ),
      ['Time grain'],
      'The option groups are all represented properly'
    );

    assert.deepEqual(
      findAll('.dropdown-parameter-picker__dropdown .ember-power-select-option').map((el) => el.textContent?.trim()),
      ['Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year'],
      'The options are all represented properly'
    );

    await selectChoose('.dropdown-parameter-picker', 'Hour');
    assert.dom('.dropdown-parameter-picker .chips').hasText('Hour', 'Date Time parameter is updated properly');
  });

  test('verify dropdown parameter input', async function (assert) {
    await visit('/reports/new');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard Two"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Inventory"]');
    await animationsSettled();

    await clickItemFilter('metric', 'Seconds');
    assert.dom('[data-filter-param="divisor"] .chips').hasText('60', 'current metric parameter rendered correctly');

    await clickInputTrigger('[data-filter-param="divisor"]');
    assert
      .dom('.dropdown-parameter-picker-input')
      .hasValue('60', 'param input exists with correct value after click the trigger');

    //test "enter" key entry
    await fillIn('.dropdown-parameter-picker-input', '22');
    await triggerKeyEvent('.dropdown-parameter-picker-input', 'keydown', 'Enter');
    assert.dom('.dropdown-parameter-picker-input').doesNotExist('param input closes after typing enter');
    assert.dom('[data-filter-param="divisor"] .chips').hasText('22', 'updated metric parameter renders correctly');

    await clickInputTrigger('[data-filter-param="divisor"]');
    assert.dom('.dropdown-parameter-picker-input').hasValue('22', 'param input renders updated value');

    //test click away key entry
    await fillIn('.dropdown-parameter-picker-input', '44');
    await click('.filter-builder__subject-name');
    assert.dom('[data-filter-param="divisor"] .chips').hasText('44', 'updated metric parameter renders correctly');
  });
});
