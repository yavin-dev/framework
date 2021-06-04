import { module, test } from 'qunit';
import { click, visit, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
//@ts-ignore
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support';
import { clickItem } from 'navi-reports/test-support/report-builder';
import { capitalize } from '@ember/string';

async function newReport() {
  await visit('/reports/new');
  await click('.report-builder-source-selector__source-button[data-source-name="Network"]');
  await animationsSettled();
}

module('Acceptance | fili datasource', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

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
        .hasText(`Date Time ${grainId}`, `The filter is updated to the ${grainId} grain`);

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

    await newReport();

    assert.dom('.report-builder-sidebar__source').hasText('Network', 'A fili table is selected');

    assert.dom('.filter-builder__subject').hasText('Date Time day', 'A date time filter exists on a new report');
    assert.dom('.filter-collection__remove').isDisabled('The date time filter cannot be removed');

    await clickItem('timeDimension', 'Date Time');
    assert.dom('.navi-column-config-item__name').hasText('Date Time (day)', 'The date time column was added');
    assert
      .dom('.navi-column-config-item__remove-icon')
      .isNotDisabled('The date time can be removed when there is an all grain');
  });

  test('Fili Required filters when changing table', async function (assert) {
    assert.expect(2);

    await newReport();
    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Table A"]');
    await animationsSettled();

    assert.dom('.filter-builder__subject').hasText('Date Time day', 'A date time filter exists after switching tables');
    assert.dom('.filter-collection__remove').isDisabled('The date time filter cannot be removed');
  });

  test('Fili Required filters when changing table without all grain', async function (assert) {
    assert.expect(4);

    await newReport();
    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Table C"]');
    await animationsSettled();

    assert.dom('.filter-builder__subject').hasText('Date Time day', 'A date time filter exists after switching tables');
    assert.dom('.filter-collection__remove').isDisabled('The date time filter cannot be removed');

    assert
      .dom('.navi-column-config-item__name')
      .hasText('Date Time (day)', 'A date time column exists after switching to a table with no all grain');
    assert.dom('.navi-column-config-item__remove-icon').isDisabled('The date time column cannot be removed');
  });

  test('Fili supports since and before operators', async function (assert) {
    assert.expect(2);

    await newReport();

    await clickItem('dimension', 'Date Time');
    await selectChoose('.navi-column-config-item__parameter', 'Year');

    await selectChoose('.filter-builder__operator-trigger', 'Before');
    await click('.navi-report__run-btn');
    assert.dom('.table-row').hasText('2013', 'Results are fetched for Before operator');

    await selectChoose('.filter-builder__operator-trigger', 'Since');
    await click('.dropdown-date-picker__trigger');
    await click('.ember-power-calendar-selector-nav-control--previous');
    await click('[data-date="2015"]');

    await click('.navi-report__run-btn');
    assert.dom('.table-row').hasText('2015', 'Results are fetched for Since operator');
  });

  test('Fili Dimension sorting disabled', async function (assert) {
    assert.expect(4);
    await newReport();

    await clickItem('dimension', 'Date Time');
    assert
      .dom('.navi-column-config-base__sort-icon')
      .doesNotHaveAttribute('disabled', 'A timeDimension column can be sorted');

    await clickItem('dimension', 'Age');
    assert
      .dom('.navi-column-config-base__sort-icon')
      .hasAttribute('disabled', '', 'A dimension column cannot be sorted');
    assert
      .dom('.navi-column-config-base__sort-icon')
      .hasAttribute('title', 'This column cannot be sorted', 'A dimension column cannot be sorted');

    await clickItem('metric', 'Revenue');
    assert.dom('.navi-column-config-base__sort-icon').doesNotHaveAttribute('disabled', 'A metric column can be sorted');
  });

  test('Fili Remove time column (all grain)', async function (assert) {
    assert.expect(4);

    await visit('/reports/1/edit');

    // select month grain
    await click('.navi-column-config-item__trigger');
    await selectChoose('.navi-column-config-item__parameter', 'Month');

    await clickTrigger('.filter-values--date-range-input__low-value');
    await click('.ember-power-calendar-selector-month[data-date="2015-01"]');

    await clickTrigger('.filter-values--date-range-input__high-value');
    await click('.ember-power-calendar-selector-month[data-date="2015-05"]');

    assert
      .dom('.filter-values--date-range-input__low-value input')
      .hasValue('Jan 2015', 'The start date is month Jan 2015');
    assert
      .dom('.filter-values--date-range-input__high-value input')
      .hasValue('May 2015', 'The end date is month May 2015');

    assert
      .dom('.filter-values--date-range-input__low-value input')
      .hasValue('Jan 2015', 'The start date is not changed');
    assert
      .dom('.filter-values--date-range-input__high-value input')
      .hasValue('May 2015', 'The end date is not changed');
  });

  test('Fili filter grain updates column grain', async function (assert) {
    assert.expect(6);
    await visit('reports/1/edit');

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent?.trim()),
      ['Date Time (day)', 'Property (id)', 'Ad Clicks', 'Nav Link Clicks'],
      'All columns exist as expected'
    );

    await selectChoose('.dropdown-parameter-picker', 'year');
    assert
      .dom('.filter-builder__subject')
      .hasText('Date Time year', 'Date time matches existing filter grain on the report');
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent?.trim()),
      ['Date Time (year)', 'Property (id)', 'Ad Clicks', 'Nav Link Clicks'],
      'Date Time column is updated to match filter grain of year'
    );

    await click('.navi-column-config-item__remove-icon'); // Remove Date Time (day)
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent?.trim()),
      ['Property (id)', 'Ad Clicks', 'Nav Link Clicks'],
      'Date Time is removed'
    );

    await selectChoose('.dropdown-parameter-picker', 'isoWeek');

    assert
      .dom('.filter-builder__subject')
      .hasText('Date Time isoWeek', 'Date time matches existing filter grain on the report');

    await clickItem('dimension', 'Date Time');

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent?.trim()),
      ['Property (id)', 'Ad Clicks', 'Nav Link Clicks', 'Date Time (isoWeek)'],
      'A Date Time column is added matching the existing filter grain'
    );
  });

  test('Fili filter parameter updates', async function (assert) {
    assert.expect(2);
    await visit('/reports/2/edit');

    assert.dom(findAll('.filter-builder__values')[1]).hasText('× 114 × 100001', 'The values are populated');
    await selectChoose('[data-filter-subject="Property (id)"][data-filter-param="field"]', 'desc');
    assert
      .dom(findAll('.filter-builder__values')[1])
      .hasText('', 'The values are cleared after switching dimension fields');
  });
});
