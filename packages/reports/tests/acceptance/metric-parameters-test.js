import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import $ from 'jquery';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import { clickItem } from 'navi-reports/test-support/report-builder';

module('Acceptance | navi-report - metric parameters', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('auto open metric config', async function(assert) {
    assert.expect(3);

    await visit('/reports/1/view');
    //add revenue (metric with params)
    await clickItem('metric', 'Platform Revenue'); // add but don't reset state
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

  test('metric config - filter parameter', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'Euro');

    assert.ok(!!$('.filter-builder__subject:contains(EUR)'), 'The parameterized metric is added as a filter');
    assert.ok(!!$('.filter-builder__subject:contains(USD)'), 'The parameterized metric is added as a filter');
    await close();
  });

  test('metric filter', async function(assert) {
    assert.expect(3);

    await visit('/reports/1/view');
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'Dollars (USD)');
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'Dollars (CAD)');
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'Euro');

    assert.ok(!!$('.filter-builder__subject:contains(EUR)'), 'The filter contains EUR');
    assert.ok(!!$('.filter-builder__subject:contains(USD)'), 'The filter contains USD');
    assert.ok(!!$('.filter-builder__subject:contains(CAD)'), 'The filter contains CAD');
  });
});
