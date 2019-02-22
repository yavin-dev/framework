import { findAll, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { selectChoose } from 'ember-power-select/test-support/helpers';

module('Acceptance | line chart', function(hooks) {
  setupApplicationTest(hooks);

  test('tooltip updates', async function(assert) {
    assert.expect(2);

    await visit('/line-chart');
    let container = this.application.__container__;

    showTooltip(container);

    // check text of the tooltip container
    assert.dom('.sub-title').hasText('Ad Clicks', "The tooltip contains the metric's display name.");

    // Select a different metric
    selectChoose('.dimension-line-chart-config__metric-selector', 'Revenue (USD)');

    showTooltip(container);

    // check text of the tooltip container
    assert
      .dom('.sub-title')
      .hasText(
        'Revenue (USD)',
        'The tooltip contains the correct metric display name after a new parameterized metric is selected'
      );
  });

  test('custom chart builders', async function(assert) {
    assert.expect(1);

    await visit('/line-chart');

    let customChartBuilderSeries = find('.custom-chart-builder .c3-legend-item')
      .toArray()
      .map(e => e.textContent);
    assert.deepEqual(
      customChartBuilderSeries,
      ['custom', 'series', 'grouping'],
      'A custom chart builder can be supplied for unique series grouping logic'
    );
  });

  /**
   * @function showTooltip
   * @param {Object} container - app container
   * This will show the chart tooltip so that we can fetch its contents.
   */
  function showTooltip(container) {
    let emberId = find(findAll('.chart-container .navi-vis-c3-chart')[1]).id,
      component = container.lookup('-view-registry:main')[emberId],
      c3 = component.get('chart');
    c3.tooltip.show({ x: 1 });
  }
});
