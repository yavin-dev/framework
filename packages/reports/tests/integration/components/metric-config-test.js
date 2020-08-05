import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { set } from '@ember/object';
import { setupMirage } from 'ember-cli-mirage/test-support';
import RSVP, { reject } from 'rsvp';
import { A as arr } from '@ember/array';
import { clickItem, clickItemFilter, getItem, getAll } from 'navi-reports/test-support/report-builder';
import { INTRINSIC_VALUE_EXPRESSION } from 'navi-data/models/metadata/function-argument';

let MockRequest, MockMetric, MetadataService;

const TEMPLATE = hbs`<MetricConfig
  @metric={{this.metric}}
  @request={{this.request}}
  @onAddParameterizedMetric={{this.addParameterizedMetric}}
  @onRemoveParameterizedMetric={{this.removeParameterizedMetric}}
  @onToggleParameterizedMetricFilter={{this.toggleParameterizedMetricFilter}}
  @parametersPromise={{this.parametersPromise}}
/>`;

module('Integration | Component | metric config', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:bard-metadata');

    MockMetric = {
      id: 'metric1',
      name: 'Metric 1',
      arguments: [
        {
          id: 'currency',
          type: 'ref',
          expression: 'dimension:displayCurrency'
        },
        {
          id: 'property',
          type: 'ref',
          expression: 'dimension:property'
        },
        {
          id: 'embargo',
          type: 'ref',
          expression: INTRINSIC_VALUE_EXPRESSION,
          _localValues: [
            { id: 'Y', description: 'Embargo enforced' },
            { id: 'N', description: 'No Embargo' }
          ]
        },
        {
          id: 'invalid',
          type: 'invalid',
          name: 'invalid'
        }
      ]
    };

    MockRequest = {
      metrics: arr([
        {
          metric: MockMetric,
          parameters: {
            as: 'currencyUSD',
            currency: 'USD'
          }
        }
      ]),
      having: arr([
        {
          metric: {
            metric: MockMetric,
            parameters: {
              as: 'currencyUSD',
              currency: 'USD'
            }
          }
        }
      ])
    };

    set(this, 'addParameterizedMetric', () => {});
    set(this, 'removeParameterizedMetric', () => {});
    set(this, 'toggleParameterizedMetricFilter', () => {});

    await MetadataService.loadMetadata();
    set(this, 'metric', MockMetric);
    set(this, 'request', MockRequest);
    await render(TEMPLATE);
  });

  test('it renders', async function(assert) {
    assert.expect(5);

    assert.dom('.metric-config').isVisible('Metric Config component is rendered');

    assert
      .dom('.metric-config__dropdown-trigger .metric-config__trigger-icon')
      .isVisible('An icon is shown as the trigger to the dropdown');

    await clickTrigger('.metric-config__dropdown-trigger');

    assert.dom('.metric-config__dropdown-container').exists('the trigger opens a dropdown on click');

    assert
      .dom('.metric-config__footer .metric-config__done-btn')
      .exists('the done button is rendered in the footer of the component');

    await click('.metric-config__done-btn');

    assert.dom('.metric-config__dropdown-container').doesNotExist('the done button closes the dropdown on click');
  });

  test('grouped list', async function(assert) {
    assert.expect(3);

    await clickTrigger('.metric-config__dropdown-trigger');

    assert
      .dom('.metric-config__dropdown-container .navi-list-selector__title')
      .hasText('Metric 1', 'the metric name is included in the header');

    assert.deepEqual(
      findAll('.grouped-list__group-header').map(el => el.textContent.trim()),
      ['embargo (2)', 'currency (14)', 'property (4)'],
      'The group headers reflect the two parameters in the metric'
    );

    const embargoList = (await getAll('metricConfig')).filter(config => config.includes('Embargo'));

    assert.deepEqual(embargoList, ['Embargo enforced (Y)', 'No Embargo (N)'], 'Enum elements are correctly displayed');
  });

  test('add/remove param', async function(assert) {
    assert.expect(4);

    await render(TEMPLATE);

    set(this, 'addParameterizedMetric', (metric, param) => {
      assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

      assert.deepEqual(param, { currency: 'AMD' }, 'The selected param is also passed to the action');
    });

    set(this, 'removeParameterizedMetric', () => assert.notOk(true, 'removeParameterizedMetric is not called'));

    await clickTrigger('.metric-config__dropdown-trigger');

    await clickItem('metricConfig', 'Drams');

    //clicking again adds when feature flag is on
    await clickItem('metricConfig', 'Drams');
  });

  test('filter icon', async function(assert) {
    assert.expect(4);

    this.set('toggleParameterizedMetricFilter', (metric, param) => {
      assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

      assert.deepEqual(param, { currency: 'AMD' }, 'The selected param is also passed to the action');
    });

    await clickTrigger('.metric-config__dropdown-trigger');

    let { item: usdItem, reset: usdReset } = await getItem('metricConfig', 'Dollars', 'USD');
    assert.ok(
      usdItem.querySelector('.grouped-list__filter--active'),
      'The filter icon with the `USD` param has the active class'
    );
    await usdReset();

    let { item: amdItem, reset: amdReset } = await getItem('metricConfig', 'Drams');
    assert.notOk(
      amdItem.querySelector('.grouped-list__filter--active'),
      'The filter icon with the `AMD` param does not have the active class'
    );
    await amdReset();

    await clickItemFilter('metricConfig', 'Drams');
  });

  test('loader', async function(assert) {
    assert.expect(1);

    //_fetchAllParams overwrites the parametersPromise property
    set(this, 'noOpFetch', () => {});
    set(this, 'parametersPromise', new RSVP.Promise((resolve /*, reject*/) => setTimeout(() => resolve, 400)));

    await render(hbs`
      {{metric-config
        metric=metric
        request=request
        onAddParameterizedMetric=(action addParameterizedMetric)
        onRemoveParameterizedMetric=(action removeParameterizedMetric)
        onToggleParameterizedMetricFilter=(action toggleParameterizedMetricFilter)
        parametersPromise=parametersPromise
        _fetchAllParams=noOpFetch
      }}`);

    await clickTrigger('.metric-config__dropdown-trigger');
    assert.dom('.navi-loader__container').isVisible('The loader is displayed while the promise is pending');
  });

  test('error message', async function(assert) {
    assert.expect(1);

    await clickTrigger('.metric-config__dropdown-trigger');
    set(this, 'parametersPromise', reject());
    await settled();

    assert
      .dom('.metric-config__error-msg')
      .hasText(
        'OOPS! Something went wrong. Please try refreshing the page.',
        'The error message is displayed when the promise is rejected'
      );
  });
});
