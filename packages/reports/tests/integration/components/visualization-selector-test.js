import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | visualization-selector', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(3);

    this.report = {
      visualization: {
        type: 'line-chart'
      }
    };
    this.currentView = 'line-chart';
    this.validVisualizations = [
      {
        name: 'line-chart',
        niceName: 'Line Chart',
        icon: 'line-chart'
      },
      {
        name: 'bar-chart',
        niceName: 'Bar Chart',
        icon: 'bar-chart'
      },
      {
        name: 'table',
        niceName: 'Data Table',
        icon: 'table'
      }
    ];
    this.onVisualizationTypeUpdate = name => {
      assert.equal(name, 'request-preview', 'The clicked visualization type is sent to the update type action');
    };

    await render(hbs`<VisualizationSelector 
      @report={{report}}
      @validVisualizations={{validVisualizations}}
      @currentVisualization={{currentView}}
      @onVisualizationTypeUpdate={{action onVisualizationTypeUpdate}}
    />`);

    assert.deepEqual(
      findAll('.visualization-selector__option').map(el => el.title),
      ['Request Preview', 'Line Chart', 'Bar Chart', 'Data Table'],
      'Each valid visualization and the request preview are included '
    );

    assert
      .dom('.visualization-selector__option--is-active')
      .hasAttribute('title', 'Line Chart', 'The visualization type in the report is shown as the selected option');

    await click('.visualization-selector__option[title="Request Preview"]');
  });
});
