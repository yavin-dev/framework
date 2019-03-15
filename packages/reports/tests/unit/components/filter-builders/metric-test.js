import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | filter builders/metric', function(hooks) {
  setupTest(hooks);

  test('filter property', function(assert) {
    assert.expect(3);

    const mockHavingFragment = {
      metric: { metric: { longName: 'Page Views' } },
      operator: 'gt',
      values: [1000]
    };

    let metricBuilder = this.owner
      .factoryFor('component:filter-builders/metric')
      .create({ requestFragment: mockHavingFragment });

    assert.deepEqual(
      metricBuilder.get('filter.subject'),
      mockHavingFragment.metric,
      'Filter subject matches the metric from the request fragment'
    );

    assert.deepEqual(
      metricBuilder.get('filter.operator'),
      A(metricBuilder.get('supportedOperators')).findBy('id', mockHavingFragment.operator),
      'Filter operator matches the supported operator object with the id from the request fragment'
    );

    assert.deepEqual(
      metricBuilder.get('filter.values'),
      mockHavingFragment.values,
      'Filter values match the values property in the request fragment'
    );
  });
});
