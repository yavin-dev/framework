import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | print dashboard', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('print dashboards index', async function(assert) {
    assert.expect(1);
    await visit('/print/dashboards/1');

    assert.equal(currentURL(), '/print/dashboards/1/view', 'Redirect to view sub route');
  });

  test('print dashboards view', async function(assert) {
    assert.expect(12);
    await visit('/print/dashboards/1/view');

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
});
