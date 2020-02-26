import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { set } from '@ember/object';
import $ from 'jquery';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import RSVP, { reject } from 'rsvp';
import { A as arr } from '@ember/array';
import {
  clickItemFilter,
  getItem,
  getAll,
  clickShowSelected,
  renderAll
} from 'navi-reports/test-support/report-builder';
import { didRender } from 'navi-reports/test-support/vertical-collection';

let MockRequest, MockMetric, MetadataService;

module('Integration | Component | metric config', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:bard-metadata');

    MockMetric = {
      name: 'metric1',
      longName: 'Metric 1',
      parameters: {
        currency: {
          type: 'dimension',
          dimensionName: 'displayCurrency'
        },
        property: {
          type: 'dimension',
          dimensionName: 'property'
        },
        embargo: {
          type: 'enum',
          values: [{ id: 'Y', description: 'Embargo enforced' }, { id: 'N', description: 'No Embargo' }]
        },
        invalid: {
          type: 'invalid',
          name: 'invalid'
        }
      }
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
    await render(hbs`
      {{metric-config
        metric=metric
        request=request
        onAddParameterizedMetric=(action addParameterizedMetric)
        onRemoveParameterizedMetric=(action removeParameterizedMetric)
        onToggleParameterizedMetricFilter=(action toggleParameterizedMetricFilter)
        parametersPromise=parametersPromise
      }}`);
  });

  test('it renders', async function(assert) {
    assert.expect(5);

    assert.dom('.metric-config').isVisible('Metric Config component is rendered');

    assert
      .dom('.metric-config__dropdown-trigger .metric-config__trigger-icon')
      .isVisible('An icon is shown as the trigger to the dropdown');

    await clickTrigger('.metric-config__dropdown-trigger');
    await didRender();

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
    await didRender();

    assert
      .dom('.metric-config__dropdown-container .navi-list-selector__title')
      .hasText('Metric 1', 'the metric longName is included in the header');

    assert.deepEqual(
      findAll('.grouped-list__group-header').map(el => el.textContent.trim()),
      ['embargo (2)', 'currency (14)', 'property (4)'],
      'The group headers reflect the two parameters in the metric'
    );

    const embargoList = (await getAll('metricConfig')).filter(config => config.includes('Embargo'));

    assert.deepEqual(embargoList, ['Embargo enforced (Y)', 'No Embargo (N)'], 'Enum elements are correctly displayed');
  });

  test('show selected', async function(assert) {
    assert.expect(3);

    await clickTrigger('.metric-config__dropdown-trigger');
    await didRender();

    assert.ok(
      (await getAll('metricConfig')).length > this.get('request.metrics.length'),
      'Initially all the parameters are shown in the metric-config'
    );

    await clickShowSelected('metricConfig');

    assert.deepEqual(
      await getAll('metricConfig'),
      ['Dollars (USD)'],
      'When show selected is clicked only the selected parameter is shown'
    );

    const resetRenderAll = await renderAll('metricConfig');
    assert.notOk(findAll('.grouped-list__add-icon--deselected').length, 'The selected items are marked as selected');
    await resetRenderAll();
  });

  test('add/remove param', async function(assert) {
    assert.expect(4);

    set(this, 'addParameterizedMetric', (metric, param) => {
      assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

      assert.deepEqual(param, { currency: 'AMD' }, 'The selected param is also passed to the action');
    });

    set(this, 'removeParameterizedMetric', (metric, param) => {
      assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

      assert.deepEqual(param, { currency: 'USD' }, 'The selected param is also passed to the action');
    });

    await clickTrigger('.metric-config__dropdown-trigger');
    await didRender();
    //add Param `Drams`
    await click($('.grouped-list__item:contains(Drams) .grouped-list__add-icon')[0]);

    //remove Param `Dollars(USD)`
    await click($('.grouped-list__item:contains(USD) .grouped-list__add-icon')[0]);
  });

  test('filter icon', async function(assert) {
    assert.expect(4);

    this.set('toggleParameterizedMetricFilter', (metric, param) => {
      assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

      assert.deepEqual(param, { currency: 'AMD' }, 'The selected param is also passed to the action');
    });

    await clickTrigger('.metric-config__dropdown-trigger');
    await didRender();

    let { item: usdItem, reset: usdReset } = await getItem('metricConfig', 'USD');
    assert.ok(
      usdItem.querySelector('.grouped-list__filter--active'),
      'The filter icon with the `USD` param has the active class'
    );
    await usdReset();

    let { item: amdItem, reset: amdReset } = await getItem('metricConfig', 'AMD');
    assert.notOk(
      amdItem.querySelector('.grouped-list__filter--active'),
      'The filter icon with the `AMD` param does not have the active class'
    );
    await amdReset();

    await clickItemFilter('metricConfig', 'AMD');
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
    await didRender();
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
