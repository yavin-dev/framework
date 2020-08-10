import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';

let TEMPLATE = hbs`
<NaviVisualizationConfig::ColorChange
  @request={{this.request}}
  @response={{this.response}}
  @seriesConfig={{this.seriesConfig}}
  @onUpdateConfig={{this.onUpdateConfig}}
/>`;

const REQUEST = {
  logicalTable: {
    timeGrain: 'day'
  },
  intervals: [
    {
      start: '2015-12-14 00:00:00.000',
      end: '2015-12-15 00:00:00.000'
    }
  ],
  metrics: [
    {
      metric: 'totalPageViews'
    }
  ],
  dimensions: [
    {
      dimension: 'age'
    }
  ]
};

const RESPONSE = [
  {
    dateTime: '2015-12-14 00:00:00.000',
    'age|id': '-3',
    'age|desc': 'All Other',
    totalPageViews: 310382162
  },
  {
    dateTime: '2015-12-14 00:00:00.000',
    'age|id': '1',
    'age|desc': 'under 13',
    totalPageViews: 2072620639
  },
  {
    dateTime: '2015-12-14 00:00:00.000',
    'age|id': '2',
    'age|desc': '13 - 25',
    totalPageViews: 2620639
  },
  {
    dateTime: '2015-12-14 00:00:00.000',
    'age|id': '3',
    'age|desc': '25 - 35',
    totalPageViews: 72620639
  },
  {
    dateTime: '2015-12-14 00:00:00.000',
    'age|id': '4',
    'age|desc': '35 - 45',
    totalPageViews: 72620639
  }
];

const SERIESCONFIG = {
  colors: ['#87d812', '#fed800', '#19c6f4', '#9a2ead', '#ff3390'],
  dimensions: [{ dimension: 'age' }],
  metrics: [{ metric: 'totalPageViews' }]
};

module('Integration | Component | Config - Color-Change', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.set('request', REQUEST);
    this.set('response', RESPONSE);
    this.set('seriesConfig', SERIESCONFIG);
    this.set('onUpdateConfig', () => null);
  });

  test('all color-change elements render', async function(assert) {
    assert.expect(7);
    await render(TEMPLATE);
    assert.dom('.color-change-config').exists();
    assert.dom('.color-change__header').hasText('Change Colors:');
    assert.dom('.color-change__label-select__label').hasText('Label:');
    assert.dom('#color-change__label-select').exists();
    assert.dom('.color-change__color-select__label').hasText('Color:');
    assert.dom('#color-change__color-select').exists();
    assert.dom('.color-change__submit-button').exists();
  });

  test('color-change label options render', async function(assert) {
    await render(TEMPLATE);
    await clickTrigger('.color-change__label-select');
    assert.dom('.ember-power-select-option').exists({ count: RESPONSE.length });
  });
});
