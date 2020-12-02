import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | print dashboard', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('print dashboards index', async function(assert) {
    assert.expect(2);
    await visit('/print/dashboards/1');

    assert.equal(currentURL(), '/print/dashboards/1/view', 'Redirect to view sub route');
    assert.dom('.navi-dashboard--print-pdf').exists('Correct filetype classes are present');
  });

  test('print dashboards view', async function(assert) {
    assert.expect(14);
    await visit('/print/dashboards/1/view');

    assert.dom('.navi-dashboard--print-pdf').exists('Correct filetype classes are present');

    assert.dom('.grid-stack').doesNotExist('grid stack is not loaded for pdf');

    assert.dom('.page-title').isNotVisible('Page title should not be visible');

    assert.dom('.editable-label__icon').isNotVisible('Title edit icon should not be visible');

    assert.dom('.favorite-item').isNotVisible('Favorite icon should not be visible');

    assert.dom('.dashboard-actions').isNotVisible('Dashboard actions should not be visible');

    assert.deepEqual(
      [...document.querySelectorAll('.navi-widget__title')].map(el => el.textContent.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table'],
      'Dashboard widget titles should appear'
    );

    assert.dom('.goal-gauge-widget').isVisible('Goal gauge shows up');
    assert.dom('.c3-chart-arcs-title .value-title').hasText('570.53', 'Goal gauge shows correct value');
    assert.dom('.c3-chart-arcs-title .metric-title').hasText('Ad Clicks', 'Goal gauge shows correct value');

    assert.dom('.line-chart-widget').isVisible('Line chart shows up');
    assert.deepEqual(
      [...document.querySelectorAll('.line-chart-widget .c3-legend-item')].map(el => el.textContent),
      ['Ad Clicks', 'Nav Link Clicks'],
      'The legends fill in with widget dimensions'
    );

    assert.dom('.table-widget').isVisible('Table shows up');
    assert.dom('.table-widget .table-row').exists('Table rows show up');
  });

  test('Dashboard view in PNG mode', async function(assert) {
    assert.expect(11);
    await visit('/print/dashboards/1?fileType=png');
    assert.equal(currentURL(), '/print/dashboards/1/view?fileType=png', 'Redirect to view sub route');

    assert.dom('.navi-dashboard--print-png').exists('Correct filetype classes are present');

    assert.dom('.grid-stack').exists('Grid stack exists in PNG view');

    assert.deepEqual(
      [...document.querySelectorAll('.navi-widget__title')].map(el => el.textContent.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table'],
      'Dashboard widget titles should appear'
    );

    assert.dom('.goal-gauge-widget').isVisible('Goal gauge shows up');
    assert.dom('.c3-chart-arcs-title .value-title').hasText('570.53', 'Goal gauge shows correct value');
    assert.dom('.c3-chart-arcs-title .metric-title').hasText('Ad Clicks', 'Goal gauge shows correct value');

    assert.dom('.line-chart-widget').isVisible('Line chart shows up');
    assert.deepEqual(
      [...document.querySelectorAll('.line-chart-widget .c3-legend-item')].map(el => el.textContent),
      ['Ad Clicks', 'Nav Link Clicks'],
      'The legends fill in with widget dimensions'
    );

    assert.dom('.table-widget').isVisible('Table shows up');
    assert.dom('.table-widget .table-row').exists('Table rows show up');
  });
});
