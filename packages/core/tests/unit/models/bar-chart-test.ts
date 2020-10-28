import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import StoreService from '@ember-data/store';

module('Unit | Model | Bar Chart Visualization Fragment', function(hooks) {
  setupTest(hooks);

  test('Bar chart type', function(assert) {
    assert.expect(1);

    const Store = this.owner.lookup('service:store') as StoreService;
    const { barChart } = Store.createRecord('all-the-fragments');
    assert.equal(barChart.type, 'bar-chart', 'bar chart config has correct chart type');
  });
});
