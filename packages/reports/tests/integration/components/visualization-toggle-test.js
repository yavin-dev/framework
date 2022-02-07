import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | visualization toggle', function (hooks) {
  setupRenderingTest(hooks);

  test('visualization toggle', async function (assert) {
    assert.expect(3);

    const visualizationServices = this.owner.lookup('service:visualization');

    const BarChartManifest = visualizationServices.getVisualization('c3:bar-chart');
    const LineChartManifest = visualizationServices.getVisualization('c3:line-chart');
    const TableManifest = visualizationServices.getVisualization('yavin:table');

    this.set('validVisualizations', [BarChartManifest, LineChartManifest, TableManifest]);
    this.set('report', {
      visualization: {
        manifest: BarChartManifest,
      },
    });
    this.set('onVisualizationTypeUpdate', function (visManifest) {
      assert.equal(visManifest, LineChartManifest, 'The clicked visualization name is sent to the action');
    });

    await render(hbs`
      {{visualization-toggle
        report=report
        validVisualizations=validVisualizations
        onVisualizationTypeUpdate=onVisualizationTypeUpdate
      }}`);

    assert.deepEqual(
      findAll('.visualization-toggle__option-icon').map((el) => el.attributes.title.value),
      ['Bar Chart', 'Line Chart', 'Table'],
      'All valid visualizations are shown as options'
    );

    assert
      .dom('.visualization-toggle__option--is-active')
      .hasAttribute('title', 'Bar Chart', 'The visualization type of the report is selected/active');

    await click('.visualization-toggle__option-icon[title="Line Chart"]');
  });
});
