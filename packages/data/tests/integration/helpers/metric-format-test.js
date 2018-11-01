import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

let metaService;

module('helper:metric-format', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    metaService = this.owner.lookup('service:bard-metadata');
    return metaService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders with serialized metric object', async function(assert) {
    assert.expect(7);
    this.set('metric', {
      metric: 'revenue',
      parameters: { currency: 'USD', as: 'revenueUSD' }
    });

    await render(hbs`{{metric-format metric}}`);
    assert.dom('*').hasText('Revenue (USD)');

    this.set('metric', {
      metric: 'revenue',
      parameters: { currency: 'CAD', as: 'revenueUSD' }
    });
    assert.dom('*').hasText('Revenue (CAD)');

    this.set('metric', { metric: 'revenue' });
    assert.dom('*').hasText('Revenue');

    this.set('metric', { metric: null });
    assert.dom('*').hasText('--');

    this.set('metric', null);
    assert.dom('*').hasText('--');

    this.set('metric', { metric: '' });
    assert.dom('*').hasText('--');

    this.set('metric', { metric: 'foo' });
    assert.dom('*').hasText('foo');
  });
});
