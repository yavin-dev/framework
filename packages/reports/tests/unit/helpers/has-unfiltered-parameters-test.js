import { moduleFor, test } from 'ember-qunit';

moduleFor('helper:has-unfiltered-parameters', 'Unit | Helper | has unfiltered parameters');

test('has unfiltered parameters', function(assert) {
  assert.expect(4);

  let hasUnfilteredParameters = this.subject();

  let request = { metrics: [], having: [] },
      metric = { metric: { name: 'foo' }, parameters: { bar: 'baz' }, canonicalName: 'foo(bar=baz)' };

  assert.ok(hasUnfilteredParameters.compute([ metric.metric, request ]),
    'hasUnfilteredParameters returns true when the metric is not selected');

  request = { metrics: [ metric ], having: [] };
  assert.ok(hasUnfilteredParameters.compute([ metric.metric, request ]),
    'hasUnfilteredParameters returns true when the metric is selected but unfiltered');

  request = { metrics: [ metric ], having: [{ metric }] };
  assert.notOk(hasUnfilteredParameters.compute([ metric.metric, request ]),
    'hasUnfilteredParameters returns false when the metric is selected and filtered');

  let newMetric = { metric: { name: 'foo' }, parameters: { bar: 'foobaz' }, canonicalName: 'foo(bar=foobaz)' };
  request = { metrics: [ metric, newMetric ], having: [{ metric }] }
  assert.ok(hasUnfilteredParameters.compute([ newMetric.metric, request ]),
    'hasUnfilteredParameters returns true when the new metric of the same base is selected but unfiltered');
});
