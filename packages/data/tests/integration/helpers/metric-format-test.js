import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Helper | metric-format', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('it renders with serialized metric object', async function(assert) {
    assert.expect(7);
    this.set('metric', {
      metric: 'revenue',
      parameters: { currency: 'USD', as: 'revenueUSD' }
    });

    await render(hbs`{{metric-format this.metric}}`);
    assert.dom().hasText('Revenue (USD)');

    this.set('metric', {
      metric: 'revenue',
      parameters: { currency: 'CAD', as: 'revenueUSD' }
    });
    assert.dom().hasText('Revenue (CAD)');

    this.set('metric', { metric: 'revenue' });
    assert.dom().hasText('Revenue');

    this.set('metric', { metric: null });
    assert.dom().hasText('--');

    this.set('metric', null);
    assert.dom().hasText('--');

    this.set('metric', { metric: '' });
    assert.dom().hasText('--');

    this.set('metric', { metric: 'foo' });
    assert.dom().hasText('foo');
  });

  test('multi-datasource support', async function(assert) {
    assert.expect(3);
    const metaData = this.owner.lookup('service:bard-metadata');
    metaData._keg.reset();
    await metaData.loadMetadata({ dataSourceName: 'bardTwo' });

    this.set('metric', {
      metric: 'usedAmount',
      parameters: {}
    });

    this.set('namespace', 'bardTwo');
    await render(hbs`{{metric-format this.metric this.namespace}}`);
    assert.dom().hasText('Used Amount', 'metric is looked up and rendered');

    this.set('metric', {
      metric: 'navClicks',
      parameters: {}
    });
    assert.dom().hasText('navClicks', 'Fall back works');

    this.set('namespace', undefined);
    assert.dom().hasText('navClicks', 'default works if datasource is not loaded');

    metaData._keg.reset();
  });
});
