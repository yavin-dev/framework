import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
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
    assert.equal(find('*').textContent.trim(), 'Revenue (USD)');

    this.set('metric', {
      metric: 'revenue',
      parameters: { currency: 'CAD', as: 'revenueUSD' }
    });
    assert.equal(find('*').textContent.trim(), 'Revenue (CAD)');

    this.set('metric', { metric: 'revenue' });
    assert.equal(find('*').textContent.trim(), 'Revenue');

    this.set('metric', { metric: null });
    assert.equal(find('*').textContent.trim(), '--');

    this.set('metric', null);
    assert.equal(find('*').textContent.trim(), '--');

    this.set('metric', { metric: '' });
    assert.equal(find('*').textContent.trim(), '--');

    this.set('metric', { metric: 'foo' });
    assert.equal(find('*').textContent.trim(), 'foo');
  });
});
