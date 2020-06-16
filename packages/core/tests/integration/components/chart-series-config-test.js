import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

let MetadataService;

const TEMPLATE = hbs`
  {{chart-series-config
    seriesConfig=seriesConfig
    seriesType=seriesType
    onUpdateConfig=(action onUpdateConfig)
  }}
`;

const SERIES_CONFIG = {
  metrics: [
    {
      metric: 'adClicks',
      parameters: {}
    },
    {
      metric: 'revenue',
      parameters: {
        currency: 'CAD',
        as: 'm1'
      }
    },
    {
      metric: 'revenue',
      parameters: {
        currency: 'EUR',
        as: 'm2'
      }
    }
  ],
  dimensions: [
    {
      name: 'Property 1'
    },
    {
      name: 'Property 2'
    },
    {
      name: 'Property 3'
    }
  ]
};

module('Integration | Component | chart series config', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.setProperties({
      seriesType: 'dimension',
      seriesConfig: SERIES_CONFIG,
      onUpdateConfig: () => null
    });

    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  test('Component renders', async function(assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.dom('.line-chart-config__series-config').exists('The chart series config component is rendered');
  });

  test('Component renders dimensions correctly', async function(assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.line-chart-config__series-config__item__content').map(el => el.textContent.trim()),
      ['Property 1', 'Property 2', 'Property 3'],
      'Component renders dimension names correctly'
    );
  });

  test('Component renders formatted metrics correctly', async function(assert) {
    assert.expect(1);

    this.setProperties({
      isOpen: true,
      seriesType: 'metric'
    });

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.line-chart-config__series-config__item__content').map(el => el.textContent.trim()),
      ['Ad Clicks', 'Revenue (CAD)', 'Revenue (EUR)'],
      'Component renders metric names correctly'
    );
  });
});
