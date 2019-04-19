import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { set } from '@ember/object';
import $ from 'jquery';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import RSVP, { reject } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { A as arr } from '@ember/array';

let MockRequest, MockMetric, MetadataService;

module('Integration | Component | metric config', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    MetadataService = this.owner.lookup('service:bard-metadata');
    setupMock();

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

    return MetadataService.loadMetadata().then(async () => {
      await render(hbs`
        {{metric-config
          metric=metric
          request=request
          onAddParameterizedMetric=(action addParameterizedMetric)
          onRemoveParameterizedMetric=(action removeParameterizedMetric)
          onToggleParameterizedMetricFilter=(action toggleParameterizedMetricFilter)
          parametersPromise=parametersPromise
        }}`);

      set(this, 'metric', MockMetric);
      set(this, 'request', MockRequest);
    });
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', async function(assert) {
    assert.expect(5);

    assert.dom('.metric-config').isVisible('Metric Config component is rendered');

    assert
      .dom('.metric-config__dropdown-trigger .metric-config__trigger-icon')
      .isVisible('An icon is shown as the trigger to the dropdown');

    await clickTrigger('.metric-config__dropdown-trigger');

    //wait for all promises to be resolved
    await settled();
    assert.dom('.metric-config__dropdown-container').isVisible('the trigger opens a dropdown on click');

    assert
      .dom('.metric-config__footer .metric-config__done-btn')
      .isVisible('the done button is rendered in the footer of the component');

    await click('.metric-config__done-btn');

    assert.dom('.metric-config__dropdown-container').isNotVisible('the done button closes the dropdown on click');
  });

  test('grouped list', async function(assert) {
    assert.expect(2);

    await clickTrigger('.metric-config__dropdown-trigger');

    await settled();

    assert
      .dom('.metric-config__dropdown-container .navi-list-selector__title')
      .hasText('Metric 1', 'the metric longName is included in the header');

    assert.deepEqual(
      findAll('.grouped-list__group-header').map(el => el.textContent.trim()),
      ['currency (14)', 'property (4)'],
      'The group headers reflect the two parameters in the metric'
    );
  });

  test('show selected', async function(assert) {
    assert.expect(3);

    await clickTrigger('.metric-config__dropdown-trigger');

    await settled();
    assert.ok(
      findAll('.grouped-list__item').length > this.get('request.metrics.length'),
      'Initially all the parameters are shown in the metric-config'
    );

    await click('.navi-list-selector__show-link');

    assert.deepEqual(
      findAll('.grouped-list__item').map(el => el.textContent.trim()),
      ['Dollars (USD)'],
      'When show selected is clicked only the selected parameter is shown'
    );

    assert.notOk(
      findAll('.checkbox-selector__checkbox')
        .map(el => el['checked'])
        .includes(false),
      'The selected items are checked'
    );
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
    await settled();
    //add Param `Drams`
    await click($('.grouped-list__item:contains(Drams) .grouped-list__item-label')[0]);

    //remove Param `Dollars(USD)`
    await click($('.grouped-list__item:contains(USD) .grouped-list__item-label')[0]);
  });

  test('filter icon', async function(assert) {
    assert.expect(4);

    this.set('toggleParameterizedMetricFilter', (metric, param) => {
      assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

      assert.deepEqual(param, { currency: 'AMD' }, 'The selected param is also passed to the action');
    });

    await clickTrigger('.metric-config__dropdown-trigger');

    await settled();
    assert.notOk(
      isEmpty($('.grouped-list__item:contains(USD) .checkbox-selector__filter--active')),
      'The filter icon with the `USD` param has the active class'
    );

    assert.ok(
      isEmpty($('.grouped-list__item:contains(Drams) .checkbox-selector__filter--active')),
      'The filter icon with the `Drams` param does not have the active class'
    );

    await click($('.grouped-list__item:contains(Drams) .checkbox-selector__filter')[0]);
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

    await settled();
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
