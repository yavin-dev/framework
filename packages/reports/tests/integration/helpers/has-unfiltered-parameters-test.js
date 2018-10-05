import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('helper:has-unfiltered-parameters', 'Integration | Helper | has unfiltered parameters', {
  integration: true
});

test('has unfiltered parameters', function(assert) {
  assert.expect(4);

  let request = { metrics: [], having: [] },
    metric = {
      metric: { name: 'foo' },
      parameters: { bar: 'baz' },
      canonicalName: 'foo(bar=baz)'
    };

  this.set('request', request);
  this.set('metric', metric.metric);

  this.render(hbs`<span class='has-unfiltered-parameters'>{{
    has-unfiltered-parameters
    metric
    request
  }}</span>`);

  assert.equal(
    this.$('.has-unfiltered-parameters')
      .text()
      .trim(),
    'true',
    'hasUnfilteredParameters returns true when the metric is not selected'
  );

  this.set('request', { metrics: [metric], having: [] });
  assert.equal(
    this.$('.has-unfiltered-parameters')
      .text()
      .trim(),
    'true',
    'hasUnfilteredParameters returns true when the metric is selected but unfiltered'
  );

  this.set('request', { metrics: [metric], having: [{ metric }] });
  assert.equal(
    this.$('.has-unfiltered-parameters')
      .text()
      .trim(),
    'false',
    'hasUnfilteredParameters returns false when the metric is selected and filtered'
  );

  let newMetric = {
    metric: { name: 'foo' },
    parameters: { bar: 'foobaz' },
    canonicalName: 'foo(bar=foobaz)'
  };
  this.set('metric', newMetric.metric);
  this.set('request', { metrics: [metric, newMetric], having: [{ metric }] });
  assert.equal(
    this.$('.has-unfiltered-parameters')
      .text()
      .trim(),
    'true',
    'hasUnfilteredParameters returns true when the new metric of the same base is selected but unfiltered'
  );
});
