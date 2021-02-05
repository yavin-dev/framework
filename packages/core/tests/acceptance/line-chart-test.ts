import { findAll, find, visit, click, waitFor } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { getContext } from '@ember/test-helpers';
import { TestContext } from 'ember-test-helpers';
//@ts-expect-error
import { selectChoose } from 'ember-power-select/test-support/helpers';
//@ts-expect-error
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-expect-error
import { drag } from 'ember-sortable/test-support/helpers';

module('Acceptance | line chart', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('tooltip updates', async function(assert) {
    assert.expect(2);

    await visit('/line-chart');

    // check text of the tooltip container
    await showTooltip();
    assert.dom('.chart-tooltip__sub-title').hasText('Ad Clicks', "The tooltip contains the metric's display name.");

    // Select a different metric
    await selectChoose('.metric-select__select-trigger', 'Revenue (USD)');

    // check text of the tooltip container
    await showTooltip();
    assert
      .dom('.chart-tooltip__sub-title')
      .hasText(
        'Revenue (USD)',
        'The tooltip contains the correct metric display name after a new parameterized metric is selected'
      );
  });

  test('custom chart builders', async function(assert) {
    assert.expect(1);

    await visit('/line-chart');

    assert.deepEqual(
      findAll('.custom-chart-builder .c3-legend-item').map(e => e.textContent),
      ['custom', 'series', 'grouping'],
      'A custom chart builder can be supplied for unique series grouping logic'
    );
  });

  test('line style options', async function(assert) {
    await visit('/line-chart');

    let linePath = find('svg .c3-chart-line.chart-series-0 .c3-lines path')?.getAttribute('d');

    await selectChoose('.line-chart-config__curve-opt', 'Spline');

    let linePathSpline = find('svg .c3-chart-line.chart-series-0 .c3-lines path')?.getAttribute('d');
    let lineAreaSpline = find('svg .c3-chart-line.chart-series-0 .c3-areas path')?.getAttribute('d');

    assert.notEqual(linePath, linePathSpline, 'Chart updated with new values');

    await click('.line-chart-config__area-opt-select');

    let linePathSplineArea = find('svg .c3-chart-line.chart-series-0 .c3-lines path')?.getAttribute('d');
    let lineAreaSplineArea = find('svg .c3-chart-line.chart-series-0 .c3-areas path')?.getAttribute('d');

    assert.notEqual(linePathSpline, linePathSplineArea, 'lines have been updated');
    assert.notEqual(lineAreaSpline, lineAreaSplineArea, 'Area is updated');
  });

  test('series reorder - metric', async function(assert) {
    assert.expect(4);

    await visit('/line-chart');

    // switch on `stacked` and expand the config
    await click('.chart-container.metric .line-chart-config__stacked-opt .denali-switch');
    await click('.line-chart-config__series-config__header');

    const beforeOrder = ['Unique Identifiers', 'Total Page Views', 'Revenue (USD)'];
    assert.deepEqual(
      findAll('.chart-container.metric .line-chart-config__series-config__item__content').map(el =>
        el.textContent?.trim()
      ),
      beforeOrder,
      'The headers are ordered in their initial order'
    );
    assert.deepEqual(
      findAll('.chart-container.metric .c3-legend-item').map(el => el.textContent?.trim()),
      beforeOrder,
      'The legend is ordered in the initial order'
    );

    //Drag Total Page Views to the top of the series config
    await drag(
      'mouse',
      '.chart-container.metric .chart-series-1 .line-chart-config__series-config__item__handler',
      () => ({ dx: 0, dy: 60 })
    );

    const afterOrder = ['Total Page Views', 'Unique Identifiers', 'Revenue (USD)'];
    assert.deepEqual(
      findAll('.chart-container.metric .line-chart-config__series-config__item__content').map(el =>
        el.textContent?.trim()
      ),
      afterOrder,
      'The headers are reordered as specified by the reorder'
    );
    assert.deepEqual(
      findAll('.chart-container.metric .c3-legend-item').map(el => el.textContent?.trim()),
      afterOrder,
      'The legend is reordered as specified by the reorder'
    );
  });

  test('series reorder - dimension', async function(assert) {
    assert.expect(4);

    await visit('/line-chart');

    // switch on `stacked` and expand the config
    await click('.chart-container.dimension .line-chart-config__stacked-opt .denali-switch');
    await click('.chart-container.dimension .line-chart-config__series-config__header');

    const beforeOrder = ['-3,All Other', '4,21-24', '5,25-29'];
    assert.deepEqual(
      findAll('.chart-container.dimension .line-chart-config__series-config__item__content').map(el =>
        el.textContent?.trim()
      ),
      beforeOrder,
      'The headers are ordered in their initial order'
    );
    assert.deepEqual(
      findAll('.chart-container.dimension .c3-legend-item').map(el => el.textContent?.trim()),
      beforeOrder,
      'The legend is ordered in the initial order'
    );

    //Drag '4,21-24' to the top of the series config
    await drag(
      'mouse',
      '.chart-container.dimension .chart-series-1 .line-chart-config__series-config__item__handler',
      () => ({ dx: 0, dy: 60 })
    );

    const afterOrder = ['4,21-24', '-3,All Other', '5,25-29'];
    assert.deepEqual(
      findAll('.chart-container.dimension .line-chart-config__series-config__item__content').map(el =>
        el.textContent?.trim()
      ),
      afterOrder,
      'The headers are reordered as specified by the reorder'
    );
    assert.deepEqual(
      findAll('.chart-container.dimension .c3-legend-item').map(el => el.textContent?.trim()),
      afterOrder,
      'The legend is reordered as specified by the reorder'
    );
  });

  /**
   * @function showTooltip
   * @param {Object} container - app container
   * This will show the chart tooltip so that we can fetch its contents.
   */
  async function showTooltip() {
    const emberId = findAll('.chart-container .navi-vis-c3-chart')[1]?.id;
    const component = (getContext() as TestContext).owner.lookup('-view-registry:main')[emberId];
    const c3 = component.chart;
    c3.tooltip.show({ x: 1 });
    await waitFor('.c3-tooltip-container');
  }
});
