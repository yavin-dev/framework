import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

module('Integration | Component | visualization toggle', function(hooks) {
  setupRenderingTest(hooks);

  test('visualization toggle', async function(assert) {
    assert.expect(3);

    this.set('validVisualizations', [
      {
        icon: 'bar-chart',
        name: 'bar-chart',
        niceName: 'Bar Chart'
      },
      {
        icon: 'line-chart',
        name: 'line-chart',
        niceName: 'Line Chart'
      },
      {
        icon: 'table',
        name: 'table',
        niceName: 'Data Table'
      }
    ]);
    this.set('report', {
      visualization: {
        type: 'bar-chart'
      }
    });
    this.set('onVisualizationTypeUpdate', function(visName) {
      assert.equal(visName, 'line-chart', 'The clicked visualization name is sent to the action');
    });

    await render(hbs`
      {{visualization-toggle
        report=report
        validVisualizations=validVisualizations
        onVisualizationTypeUpdate=onVisualizationTypeUpdate
      }}`);

    assert.deepEqual(
      findAll('.visualization-toggle__option').map(el => el.textContent.trim()),
      ['Bar Chart', 'Line Chart', 'Data Table'],
      'All valid visualizations are shown as options'
    );

    assert
      .dom('.visualization-toggle__option--is-active')
      .hasText('Bar Chart', 'The visualization type of the report is selected/active');

    await click($('.visualization-toggle__option:contains(Line Chart)')[0]);
  });
});
