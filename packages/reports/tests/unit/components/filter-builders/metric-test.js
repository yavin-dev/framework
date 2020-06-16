import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | filter builders/metric', function(hooks) {
  setupTest(hooks);

  test('filter property', function(assert) {
    assert.expect(3);

    const mockHavingFragment = {
      metric: { metric: { name: 'Page Views' } },
      operator: 'gt',
      values: [1000]
    };

    let metricBuilder = this.owner
      .factoryFor('component:filter-builders/metric')
      .create({ requestFragment: mockHavingFragment });

    assert.deepEqual(
      mockHavingFragment.metric,
      metricBuilder.filter.subject,
      'Filter subject matches the metric from the request fragment'
    );

    assert.deepEqual(
      A(metricBuilder.supportedOperators).findBy('id', mockHavingFragment.operator),
      metricBuilder.filter.operator,
      'Filter operator matches the supported operator object with the id from the request fragment'
    );

    assert.deepEqual(
      mockHavingFragment.values,
      metricBuilder.filter.values,
      'Filter values match the values property in the request fragment'
    );
  });
});
