import { click, visit } from '@ember/test-helpers';
//@ts-expect-error
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
//@ts-expect-error
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-expect-error
import { selectChoose } from 'ember-power-select/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | date filter', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('verify the different time grains work as expected - bard', async function(assert) {
    assert.expect(78);

    await visit('/reports/13/view');

    const timeGrains = ['Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year'];

    await click('.navi-column-config-item__trigger');

    for (const grain of timeGrains) {
      await selectChoose('.navi-column-config-item__parameter', grain);
      const grainId = grain.toLowerCase();
      assert
        .dom('.navi-column-config-item__name')
        .hasText(`Date Time (${grainId})`, 'The column config grain parameter is updated');

      assert
        .dom('.filter-builder__subject')
        .hasText(`Date Time (${grainId})`, `The filter is updated to the ${grainId} grain`);

      await selectChoose('.filter-builder__select-trigger', 'Between');
      assert.dom('.filter-builder__operator').hasText('Between', 'Between is the selected filter builder operator');

      await clickTrigger('.filter-values--date-range-input__low-value .ember-basic-dropdown-trigger');
      assert.dom('.ember-power-calendar').exists('Low value calendar opened');

      await clickTrigger('.filter-values--date-range-input__high-value .ember-basic-dropdown-trigger');
      assert.dom('.ember-power-calendar').exists('High value calendar opened');

      await selectChoose('.filter-builder__select-trigger', 'Current');
      assert
        .dom('.filter-builder__operator')
        .hasText(`Current ${grain}`, 'Current is the selected filter builder operator');

      assert.dom('.filter-values--current-period').containsText(`The current ${grainId}`, `Shows current ${grain}`);

      await selectChoose('.filter-builder__select-trigger', 'In The Past');
      assert
        .dom('.filter-builder__operator')
        .hasText('In The Past', 'In The Past is the selected filter builder operator');

      await clickTrigger('.filter-values--lookback-input .ember-basic-dropdown-trigger');
      assert.dom('.navi-basic-dropdown-content').exists('Preset dropdown opened');

      await selectChoose('.filter-builder__select-trigger', 'Since');
      assert.dom('.filter-builder__operator').hasText('Since', 'Since is the selected filter builder operator');

      await clickTrigger('.filter-values--date-input__trigger .ember-basic-dropdown-trigger');
      assert.dom('.ember-power-calendar').exists('Calendar opened');

      await selectChoose('.filter-builder__select-trigger', 'Before');
      assert.dom('.filter-builder__operator').hasText('Before', 'Before is the selected filter builder operator');

      await clickTrigger('.filter-values--date-input__trigger .ember-basic-dropdown-trigger');
      assert.dom('.ember-power-calendar').exists('Calendar opened');
    }
  });
});
