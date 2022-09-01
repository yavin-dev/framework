import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@glimmer/component';
import { YavinVisualizationManifest } from 'navi-core/visualization/manifest';
//@ts-expect-error
import { selectChoose } from 'ember-power-select/test-support/helpers';
import type VisualizationToggle from 'navi-reports/components/visualization-toggle';
import type { TestContext as Context } from 'ember-test-helpers';
import type YavinVisualizationsService from 'navi-core/services/visualization';
import type RequestFragment from 'navi-core/models/request';

type ComponentArgs = VisualizationToggle['args'];
interface TestContext extends Context, ComponentArgs {
  visualizationService: YavinVisualizationsService;
}

class TestViz extends YavinVisualizationManifest {
  namespace = 'test';
  currentVersion = 2;
  type = 'viz';
  niceName = 'Visualization';
  icon = '';
  visualizationComponent = class extends Component {};
  validate(_request: RequestFragment): { isValid: boolean; messages?: string[] | undefined } {
    return { isValid: true };
  }
  createNewSettings(): unknown {
    return {};
  }
}

const TEMPLATE = hbs`
<VisualizationToggle
  @report={{this.report}}
  @validVisualizations={{this.validVisualizations}}
  @onVisualizationTypeUpdate={{this.onVisualizationTypeUpdate}}
/>`;

module('Integration | Component | visualization toggle', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.visualizationService = this.owner.lookup('service:visualization');
  });

  test('visualization toggle', async function (this: TestContext, assert) {
    assert.expect(4);

    const BarChartManifest = this.visualizationService.getVisualization('c3:bar-chart');
    const LineChartManifest = this.visualizationService.getVisualization('c3:line-chart');
    const TableManifest = this.visualizationService.getVisualization('yavin:table');

    this.validVisualizations = [BarChartManifest, LineChartManifest, TableManifest];
    //@ts-expect-error - fake report
    this.report = { visualization: { manifest: BarChartManifest } };
    this.onVisualizationTypeUpdate = function (visManifest) {
      assert.equal(visManifest, LineChartManifest, 'The clicked visualization name is sent to the action');
    };

    await render(TEMPLATE);

    assert
      .dom('.visualization-toggle__select-trigger')
      .hasText('Standard', 'The selected visualizations category is correctly shown');

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

  test('category selection', async function (this: TestContext, assert) {
    assert.expect(7);

    this.visualizationService.registerVisualization(new TestViz(), 'Test Category');

    const BarChartManifest = this.visualizationService.getVisualization('c3:bar-chart');
    const LineChartManifest = this.visualizationService.getVisualization('c3:line-chart');
    const TableManifest = this.visualizationService.getVisualization('yavin:table');
    const TestManifest = this.visualizationService.getVisualization('test:viz');

    this.validVisualizations = [BarChartManifest, LineChartManifest, TableManifest, TestManifest];
    //@ts-expect-error - fake report
    this.report = { visualization: { manifest: TestManifest } };
    this.onVisualizationTypeUpdate = (visManifest) => {
      assert.equal(visManifest, TableManifest, 'A visualization from the clicked category is sent to the action');

      this.set('report', { visualization: { manifest: visManifest } });
    };

    await render(TEMPLATE);

    assert
      .dom('.visualization-toggle__select-trigger')
      .hasText('Test Category', 'The current visualization category is correctly shown');

    assert.deepEqual(
      findAll('.visualization-toggle__option-icon').map((el: HTMLElement) => el.getAttribute('title')),
      ['Visualization'],
      'The valid visualizations of the category are shown'
    );

    assert
      .dom('.visualization-toggle__option--is-active')
      .hasAttribute('title', 'Visualization', 'The visualization type of the report is selected/active');

    await selectChoose('.visualization-toggle__select-trigger', 'Standard');

    assert
      .dom('.visualization-toggle__select-trigger')
      .hasText('Standard', 'The selected visualizations category is correctly shown');

    assert.deepEqual(
      findAll('.visualization-toggle__option-icon').map((el: HTMLElement) => el.getAttribute('title')),
      ['Bar Chart', 'Line Chart', 'Table'],
      'All valid visualizations of the category are shown'
    );

    assert
      .dom('.visualization-toggle__option--is-active')
      .hasAttribute('title', 'Table', 'A valid visualization type from the new category is selected');
  });

  test('category with no valid visualizations', async function (this: TestContext, assert) {
    assert.expect(2);

    class InvalidTestViz extends TestViz {
      validate(_request: RequestFragment): { isValid: boolean; messages?: string[] | undefined } {
        return { isValid: false };
      }
    }

    this.visualizationService.registerVisualization(new InvalidTestViz(), 'Test Category');

    const BarChartManifest = this.visualizationService.getVisualization('c3:bar-chart');
    const LineChartManifest = this.visualizationService.getVisualization('c3:line-chart');
    const TableManifest = this.visualizationService.getVisualization('yavin:table');

    this.validVisualizations = [BarChartManifest, LineChartManifest, TableManifest];
    //@ts-expect-error - fake report
    this.report = { visualization: { manifest: TableManifest } };

    await render(TEMPLATE);

    assert
      .dom('.visualization-toggle__select-trigger')
      .hasText('Standard', 'The current visualization category is correctly shown');

    await click('.visualization-toggle__select-trigger');

    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['Standard'],
      'Only categories from valid visualizations are shown'
    );
  });

  test('component does not crash when category becomes invalid', async function (this: TestContext, assert) {
    assert.expect(1);

    const TableManifest = this.visualizationService.getVisualization('yavin:table');

    this.validVisualizations = [];
    //@ts-expect-error - fake report
    this.report = { visualization: { manifest: TableManifest } };

    await render(TEMPLATE);

    assert.dom('.visualization-toggle').exists('Component Renders without crashing');
  });
});
