import { click, fillIn, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import $ from 'jquery';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support';
import { clickItem } from 'navi-reports/test-support/report-builder';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';

module('Acceptance | navi-report - column parameters', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('auto open metric config', async function (assert) {
    assert.expect(3);

    await visit('/reports/1/view');
    //add revenue (metric with params)
    await clickItem('metric', 'Platform Revenue');
    assert.dom('.navi-column-config-base').isVisible('The metric is open in the column config');

    //close the config dropdown
    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]');
    assert.dom('.navi-column-config-base').isNotVisible('The metric config dropdown is closed when clicked again');

    //remove revenue
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Platform Revenue (USD)"]');
    assert
      .dom('.navi-column-config-base')
      .isNotVisible('The metric config dropdown container remains closed when the metric is removed');
  });

  test('column config - filter parameter', async function (assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'EUR');

    assert.ok(!!$('.filter-builder__subject:contains(EUR)'), 'The parameterized metric is added as a filter');
    assert.ok(!!$('.filter-builder__subject:contains(USD)'), 'The parameterized metric is added as a filter');
  });

  test('column filter', async function (assert) {
    assert.expect(3);

    await visit('/reports/1/view');
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'USD');
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'CAD');
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'EUR');

    assert.ok(!!$('.filter-builder__subject:contains(EUR)'), 'The filter contains EUR');
    assert.ok(!!$('.filter-builder__subject:contains(USD)'), 'The filter contains USD');
    assert.ok(!!$('.filter-builder__subject:contains(CAD)'), 'The filter contains CAD');
  });

  test('input parameter', async function (assert) {
    await visit('/reports/new');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard Two"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Inventory"]');
    await animationsSettled();

    await clickItem('metric', 'Seconds');
    assert
      .dom('.navi-column-config-item__parameter-input')
      .hasValue('60', 'param input exists with correct default value');

    assert
      .dom('.navi-column-config-item__name')
      .hasText('Seconds (60)', 'Column name contains default parameter value');

    await fillIn('.navi-column-config-item__parameter-input', '22');
    assert
      .dom('.navi-column-config-item__name')
      .hasText('Seconds (22)', 'Column name contains updated parameter value ');
  });
});
