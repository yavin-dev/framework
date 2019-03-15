import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | has unfiltered parameters', function(hooks) {
  setupRenderingTest(hooks);

  test('has unfiltered parameters', async function(assert) {
    assert.expect(4);

    let request = { metrics: [], having: [] },
      metric = {
        metric: { name: 'foo' },
        parameters: { bar: 'baz' },
        canonicalName: 'foo(bar=baz)'
      };

    this.set('request', request);
    this.set('metric', metric.metric);

    await render(hbs`<span class='has-unfiltered-parameters'>{{
      has-unfiltered-parameters
      metric
      request
    }}</span>`);

    assert.equal(
      find('.has-unfiltered-parameters').textContent.trim(),
      'true',
      'hasUnfilteredParameters returns true when the metric is not selected'
    );

    this.set('request', { metrics: [metric], having: [] });
    assert.equal(
      find('.has-unfiltered-parameters').textContent.trim(),
      'true',
      'hasUnfilteredParameters returns true when the metric is selected but unfiltered'
    );

    this.set('request', { metrics: [metric], having: [{ metric }] });
    assert.equal(
      find('.has-unfiltered-parameters').textContent.trim(),
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
      find('.has-unfiltered-parameters').textContent.trim(),
      'true',
      'hasUnfilteredParameters returns true when the new metric of the same base is selected but unfiltered'
    );
  });
});
