import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, findAll } from '@ember/test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | print dashboard', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('print dashboards index', async function (assert) {
    await visit('/print/dashboards/1');

    assert.equal(currentURL(), '/print/dashboards/1/view', 'Redirect to view sub route');
    assert.dom('.navi-dashboard--print-single-column').exists('Correct filetype classes are present');
  });

  test('print dashboards view', async function (assert) {
    await visit('/print/dashboards/1/view');

    assert.dom('.navi-dashboard--print-single-column').exists('Correct filetype classes are present');

    assert.dom('.grid-stack').doesNotExist('grid stack is not loaded for png');

    assert.dom('.page-title').isNotVisible('Page title should not be visible');

    assert.dom('.editable-label__icon').isNotVisible('Title edit icon should not be visible');

    assert.dom('.favorite-item').isNotVisible('Favorite icon should not be visible');

    assert.dom('.dashboard-actions').isNotVisible('Dashboard actions should not be visible');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table'],
      'Dashboard widget titles should appear'
    );

    assert.dom('.goal-gauge-widget').isVisible('Goal gauge shows up');
    assert.dom('.c3-chart-arcs-title .value-title').hasText('451.41', 'Goal gauge shows correct value');
    assert.dom('.c3-chart-arcs-title .metric-title').hasText('Ad Clicks', 'Goal gauge shows correct value');

    assert.dom('.line-chart-widget').isVisible('Line chart shows up');
    assert.deepEqual(
      findAll('.line-chart-widget .c3-legend-item').map((el) => el.textContent),
      ['Ad Clicks', 'Nav Link Clicks'],
      'The legends fill in with widget metrics'
    );

    assert.dom('.table-widget').isVisible('Table shows up');
    assert.dom('.table-widget .table-row').exists('Table rows show up');
  });

  test('Dashboard view in grid mode', async function (assert) {
    assert.expect(11);
    await visit('/print/dashboards/1?layout=grid');
    assert.equal(currentURL(), '/print/dashboards/1/view?layout=grid', 'Redirect to view sub route');

    assert.dom('.navi-dashboard--print-grid').exists('Correct filetype classes are present');

    assert.dom('.grid-stack').exists('Grid stack exists in grid layout');

    assert.deepEqual(
      findAll('.navi-widget__title').map((el) => el.textContent?.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table'],
      'Dashboard widget titles should appear'
    );

    assert.dom('.goal-gauge-widget').isVisible('Goal gauge shows up');
    assert.dom('.c3-chart-arcs-title .value-title').hasText('451.41', 'Goal gauge shows correct value');
    assert.dom('.c3-chart-arcs-title .metric-title').hasText('Ad Clicks', 'Goal gauge shows correct value');

    assert.dom('.line-chart-widget').isVisible('Line chart shows up');
    assert.deepEqual(
      findAll('.line-chart-widget .c3-legend-item').map((el) => el.textContent),
      ['Ad Clicks', 'Nav Link Clicks'],
      'The legends fill in with widget metrics'
    );

    assert.dom('.table-widget').isVisible('Table shows up');
    assert.dom('.table-widget .table-row').exists('Table rows show up');
  });

  test('Unordered layout gets ordered according to presentation', async function (assert) {
    assert.expect(1);
    await visit('/print/dashboards/9/view'); //dashboard 9 has random ordered presentation.layout
    const titles = findAll('.navi-widget__title').map((el) => el.textContent?.trim());
    assert.deepEqual(
      titles,
      ['Unordered 1', 'Unordered 2', 'Unordered 3', 'Unordered 4', 'Unordered 5', 'Unordered 6', 'Unordered 7'],
      'Widgets are ordered based on where they appear in grid, not order in layout'
    );
  });
});
