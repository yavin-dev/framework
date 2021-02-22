import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupAnimationTest } from 'ember-animated/test-support';
//@ts-ignore
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support';
//@ts-ignore
import { clickItem } from 'navi-reports/test-support/report-builder';
import { capitalize } from '@ember/string';

module('Acceptance | fili datasource', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupAnimationTest(hooks);

  test('verify the different time grains work as expected - fili', async function (assert) {
    assert.expect(78);

    await visit('/reports/13/view');

    const timeGrains = ['Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year'];

    await click('.navi-column-config-item__trigger');

    for (const grain of timeGrains) {
      await selectChoose('.navi-column-config-item__parameter', grain);
      const grainId = grain === 'Week' ? 'isoWeek' : grain.toLowerCase();
      assert
        .dom('.navi-column-config-item__name')
        .hasText(`Date Time (${grainId})`, 'The column config grain parameter is updated');

      assert
        .dom('.filter-builder__subject')
        .hasText(`Date Time (${grainId})`, `The filter is updated to the ${grainId} grain`);

      await selectChoose('.filter-builder__operator-trigger', 'Between');
      assert
        .dom('.filter-builder__operator-trigger')
        .hasText('Between', 'Between is the selected filter builder operator');

      await clickTrigger('.filter-values--date-range-input__low-value .ember-basic-dropdown-trigger');
      assert.dom('.ember-power-calendar').exists('Low value calendar opened');

      await clickTrigger('.filter-values--date-range-input__high-value .ember-basic-dropdown-trigger');
      assert.dom('.ember-power-calendar').exists('High value calendar opened');

      await selectChoose('.filter-builder__operator-trigger', 'Current');
      assert
        .dom('.filter-builder__operator-trigger')
        .hasText(`Current ${capitalize(grainId)}`, 'Current is the selected filter builder operator');

      assert.dom('.filter-values--current-period').containsText(`The current ${grainId}`, `Shows current ${grain}`);

      await selectChoose('.filter-builder__operator-trigger', 'In The Past');
      assert
        .dom('.filter-builder__operator-trigger')
        .hasText('In The Past', 'In The Past is the selected filter builder operator');

      await clickTrigger('.filter-values--lookback-input .ember-basic-dropdown-trigger');
      assert.dom('.filter-values--lookback-dropdown').exists('Preset dropdown opened');

      await selectChoose('.filter-builder__operator-trigger', 'Since');
      assert.dom('.filter-builder__operator-trigger').hasText('Since', 'Since is the selected filter builder operator');

      await clickTrigger('.filter-values--date-input__trigger .ember-basic-dropdown-trigger');
      assert.dom('.ember-power-calendar').exists('Calendar opened');

      await selectChoose('.filter-builder__operator-trigger', 'Before');
      assert
        .dom('.filter-builder__operator-trigger')
        .hasText('Before', 'Before is the selected filter builder operator');

      await clickTrigger('.filter-values--date-input__trigger .ember-basic-dropdown-trigger');
      assert.dom('.ember-power-calendar').exists('Calendar opened');
    }
  });

  test('Fili Required filters on new report', async function (assert) {
    assert.expect(5);

    await visit('/reports/new');

    await selectChoose('.navi-table-select__trigger', 'Network');
    assert.dom('.navi-table-select-item').hasText('Network', 'A fili table is selected');

    assert.dom('.filter-builder__subject').hasText('Date Time (day)', 'A date time filter exists on a new report');
    assert.dom('.filter-collection__remove').isDisabled('The date time filter cannot be removed');

    await clickItem('dimension', 'Date Time');
    assert.dom('.navi-column-config-item__name').hasText('Date Time (day)', 'The date time column was added');
    assert
      .dom('.navi-column-config-item__remove-icon')
      .isNotDisabled('The date time can be removed when there is an all grain');
  });

  test('Fili Required filters when changing table', async function (assert) {
    assert.expect(2);

    await visit('/reports/new');
    await selectChoose('.navi-table-select__trigger', 'Table A');

    assert
      .dom('.filter-builder__subject')
      .hasText('Date Time (day)', 'A date time filter exists after switching tables');
    assert.dom('.filter-collection__remove').isDisabled('The date time filter cannot be removed');
  });

  test('Fili Required filters when changing table without all grain', async function (assert) {
    assert.expect(4);

    await visit('/reports/new');
    await selectChoose('.navi-table-select__trigger', 'Table C');

    assert
      .dom('.filter-builder__subject')
      .hasText('Date Time (day)', 'A date time filter exists after switching tables');
    assert.dom('.filter-collection__remove').isDisabled('The date time filter cannot be removed');

    assert
      .dom('.navi-column-config-item__name')
      .hasText('Date Time (day)', 'A date time column exists after switching to a table with no all grain');
    assert.dom('.navi-column-config-item__remove-icon').isDisabled('The date time column cannot be removed');
  });
});
