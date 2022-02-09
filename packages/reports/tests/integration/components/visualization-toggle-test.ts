import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type VisualizationToggle from 'navi-reports/components/visualization-toggle';
import type { TestContext as Context } from 'ember-test-helpers';

type ComponentArgs = VisualizationToggle['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`
<VisualizationToggle
  @report={{this.report}}
  @validVisualizations={{this.validVisualizations}}
  @onVisualizationTypeUpdate={{this.onVisualizationTypeUpdate}}
/>`;

module('Integration | Component | visualization toggle', function (hooks) {
  setupRenderingTest(hooks);

  test('visualization toggle', async function (this: TestContext, assert) {
    assert.expect(3);

    const visualizationServices = this.owner.lookup('service:visualization');

    const BarChartManifest = visualizationServices.getVisualization('c3:bar-chart');
    const LineChartManifest = visualizationServices.getVisualization('c3:line-chart');
    const TableManifest = visualizationServices.getVisualization('yavin:table');

    this.validVisualizations = [BarChartManifest, LineChartManifest, TableManifest];
    //@ts-expect-error - fake report
    this.report = { visualization: { manifest: BarChartManifest } };
    this.onVisualizationTypeUpdate = function (visManifest) {
      assert.equal(visManifest, LineChartManifest, 'The clicked visualization name is sent to the action');
    };

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.visualization-toggle__option-icon').map((el: HTMLElement) => el.getAttribute('title')),
      ['Bar Chart', 'Line Chart', 'Table'],
      'All valid visualizations are shown as options'
    );

    assert
      .dom('.visualization-toggle__option--is-active')
      .hasAttribute('title', 'Bar Chart', 'The visualization type of the report is selected/active');

    await click('.visualization-toggle__option-icon[title="Line Chart"]');
  });
});
