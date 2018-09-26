import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { set } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import { run } from '@ember/runloop';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { getOwner } from '@ember/application';
import { defer, reject } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { A as arr } from '@ember/array';

let MockRequest, MockMetric, MetadataService;

moduleForComponent('metric-config', 'Integration | Component | metric config', {
  integration: true,
  beforeEach() {
    MetadataService = getOwner(this).lookup('service:bard-metadata');
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

    return MetadataService.loadMetadata().then(() => {
      this.render(hbs`
        {{metric-config
          metric=metric
          request=request
          addParameterizedMetric=(action addParameterizedMetric)
          removeParameterizedMetric=(action removeParameterizedMetric)
          toggleParameterizedMetricFilter=(action toggleParameterizedMetricFilter)
          parametersPromise=parametersPromise
        }}`);

      set(this, 'metric', MockMetric);
      set(this, 'request', MockRequest);
    });
  },
  afterEach() {
    teardownMock();
  }
});

test('it renders', function(assert) {
  assert.expect(5);

  assert.ok(this.$('.metric-config').is(':visible'), 'Metric Config component is rendered');

  assert.ok(
    this.$('.metric-config__dropdown-trigger .metric-config__trigger-icon').is(':visible'),
    'An icon is shown as the trigger to the dropdown'
  );

  run(() => clickTrigger('.metric-config__dropdown-trigger'));

  //wait for all promises to be resolved
  return wait().then(() => {
    assert.ok($('.metric-config__dropdown-container').is(':visible'), 'the trigger opens a dropdown on click');

    assert.ok(
      $('.metric-config__footer .metric-config__done-btn'),
      'the done button is rendered in the footer of the component'
    );

    run(() => $('.metric-config__done-btn').click());

    assert.notOk(
      $('.metric-config__dropdown-container').is(':visible'),
      'the done button closes the dropdown on click'
    );
  });
});

test('grouped list', function(assert) {
  assert.expect(2);

  run(() => clickTrigger('.metric-config__dropdown-trigger'));

  return wait().then(() => {
    assert.equal(
      $('.metric-config__dropdown-container .navi-list-selector__title')
        .text()
        .trim(),
      'Metric 1',
      'the metric longName is included in the header'
    );

    assert.deepEqual(
      $('.grouped-list__group-header')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['currency (14)', 'property (4)'],
      'The group headers reflect the two parameters in the metric'
    );
  });
});

test('show selected', function(assert) {
  assert.expect(3);

  run(() => clickTrigger('.metric-config__dropdown-trigger'));

  return wait().then(() => {
    assert.ok(
      $('.grouped-list__item').length > this.get('request.metrics.length'),
      'Initially all the parameters are shown in the metric-config'
    );

    run(() => $('.navi-list-selector__show-link').click());

    assert.deepEqual(
      $('.grouped-list__item')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Dollars (USD)'],
      'When show selected is clicked only the selected parameter is shown'
    );

    assert.notOk(
      $('.checkbox-selector__checkbox')
        .toArray()
        .map(el => $(el)[0]['checked'])
        .includes(false),
      'The selected items are checked'
    );
  });
});

test('add/remove param', function(assert) {
  assert.expect(4);

  set(this, 'addParameterizedMetric', (metric, param) => {
    assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

    assert.deepEqual(param, { currency: 'AMD' }, 'The selected param is also passed to the action');
  });

  set(this, 'removeParameterizedMetric', (metric, param) => {
    assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

    assert.deepEqual(param, { currency: 'USD' }, 'The selected param is also passed to the action');
  });

  run(() => clickTrigger('.metric-config__dropdown-trigger'));
  return wait().then(() => {
    //add Param `Drams`
    $('.grouped-list__item:contains(Drams) .grouped-list__item-label').click();

    //remove Param `Dollars(USD)`
    $('.grouped-list__item:contains(USD) .grouped-list__item-label').click();
  });
});

test('filter icon', function(assert) {
  assert.expect(4);

  this.set('toggleParameterizedMetricFilter', (metric, param) => {
    assert.deepEqual(metric, MockMetric, 'The mock metric is passed to the action');

    assert.deepEqual(param, { currency: 'AMD' }, 'The selected param is also passed to the action');
  });

  run(() => clickTrigger('.metric-config__dropdown-trigger'));

  return wait().then(() => {
    assert.notOk(
      isEmpty($('.grouped-list__item:contains(USD) .checkbox-selector__filter--active')),
      'The filter icon with the `USD` param has the active class'
    );

    assert.ok(
      isEmpty($('.grouped-list__item:contains(Drams) .checkbox-selector__filter--active')),
      'The filter icon with the `Drams` param does not have the active class'
    );

    run(() => {
      $('.grouped-list__item:contains(Drams) .checkbox-selector__filter').click();
    });
  });
});

test('loader', function(assert) {
  assert.expect(1);

  set(this, 'parametersPromise', defer().promise);

  run(() => clickTrigger('.metric-config__dropdown-trigger'));
  assert.ok($('.navi-loader__container').is(':visible'), 'The loader is displayed while the promise is pending');
  return wait();
});

test('error message', function(assert) {
  assert.expect(1);

  run(() => clickTrigger('.metric-config__dropdown-trigger'));
  set(this, 'parametersPromise', reject());
  return wait().then(() => {
    assert.equal(
      $('.metric-config__error-msg')
        .text()
        .trim(),
      'OOPS! Something went wrong. Please try refreshing the page.',
      'The error message is displayed when the promise is rejected'
    );
  });
});
