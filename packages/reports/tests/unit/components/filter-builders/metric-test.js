import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('filter-builders/metric', 'Unit | Component | filter builders/metric', {
  unit: true
});

test('filter property', function(assert) {
  assert.expect(3);

  const mockHavingFragment = {
    metric: { metric: { longName: 'Page Views' } },
    operator: 'gt',
    values: [1000]
  };

  let metricBuilder = this.subject({ requestFragment: mockHavingFragment });

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
