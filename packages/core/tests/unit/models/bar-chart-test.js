import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Bar Chart Visualization Fragment', function(hooks) {
  setupTest(hooks);

  test('Bar chart type', function(assert) {
    assert.expect(1);

    let chart = run(() =>
      run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('barChart')
    );
    assert.equal(get(chart, 'type'), 'bar-chart', 'bar chart config has correct chart type');
  });
});
