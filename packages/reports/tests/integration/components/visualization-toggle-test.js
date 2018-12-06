import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

moduleForComponent('visualization-toggle', 'Integration | Component | visualization toggle', {
  integration: true
});

test('visualization toggle', function(assert) {
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

  run(() => {
    this.render(hbs`
      {{visualization-toggle
        report=report
        validVisualizations=validVisualizations
        onVisualizationTypeUpdate=onVisualizationTypeUpdate
      }}`);
  });

  return run(() => {
    assert.deepEqual(
      this.$('.visualization-toggle__option')
        .toArray()
        .map(el => el.innerText.trim()),
      ['Bar Chart', 'Line Chart', 'Data Table'],
      'All valid visualizations are shown as options'
    );

    assert.equal(
      this.$('.visualization-toggle__option--is-active')[0].innerText.trim(),
      'Bar Chart',
      'The visualization type of the report is selected/active'
    );

    return run(() => {
      this.$('.visualization-toggle__option:contains(Line Chart)').click();
    });
  });
});
