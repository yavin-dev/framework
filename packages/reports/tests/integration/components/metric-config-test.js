import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { set } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import { run } from '@ember/runloop'
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { getOwner } from '@ember/application';

let MockRequest, MockMetric, MetadataService;

moduleForComponent('metric-config', 'Integration | Component | metric config', {
  integration: true,
  beforeEach() {
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    setupMock();

    MockRequest = {
      metrics: [{
        metric: 'metric1',
        parameters: {
          as: 'currencyUSD',
          currency: 'USD'
        }
      }]
    };

    MockMetric = {
      name: 'metric1',
      parameters: [{
        type: 'dimension',
        dimensionName: 'currency'
      },{
        type: 'dimension',
        dimensionName: 'property'
      },{
        type: 'invalid',
        name: 'invalid'
      }]
    };

    return MetadataService.loadMetadata().then(() => {
      this.render(hbs`
        {{metric-config
          metric=metric
          request=request
        }}`
      );

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

  assert.ok(this.$('.metric-config').is(':visible'),
    'Metric Config component is rendered');

  assert.ok(this.$('.metric-config__dropdown-trigger .metric-config__trigger-icon').is(':visible'),
    'An icon is shown as the trigger to the dropdown');

  run(() => clickTrigger('.metric-config__dropdown-trigger'));

  assert.ok($('.metric-config__dropdown-container').is(':visible'),
    'the trigger opens a dropdown on click');

  assert.ok($('.metric-config__footer .metric-config__done-btn'),
    'the done button is rendered in the footer of the component');

  run(() => $('.metric-config__done-btn').click());

  assert.notOk($('.metric-config__dropdown-container').is(':visible'),
    'the done button closes the dropdown on click');

  //wait for all promises to be resolved
  return wait();
});

test('grouped list', function(assert) {
  assert.expect(2);

  run(() => clickTrigger('.metric-config__dropdown-trigger'));

  assert.equal($('.metric-config__dropdown-container .navi-list-selector__title').text().trim(),
    'metric1',
    'the metric name is included in the header');

  return wait().then(() => {
    assert.deepEqual($('.grouped-list__group-header').toArray().map((el) => $(el).text().trim()),
      [ 'currency (14)', 'property (4)'],
      'The group headers reflect the two parameters in the metric');
  });
});

test('show selected', function(assert) {
  assert.expect(3);

  run(() => clickTrigger('.metric-config__dropdown-trigger'));

  return wait().then(() => {
    assert.ok($('.grouped-list__item').length > this.get('request.metrics.length'),
      'Initially all the parameters are shown in the metric-config');

    run(() => $('.navi-list-selector__show-link').click());

    assert.deepEqual($('.grouped-list__item').toArray().map(el => $(el).text().trim()),
      [ 'Dollars (USD)' ],
      'When show selected is clicked only the selected parameter is shown');

    assert.notOk($('.checkbox-selector__checkbox').toArray().map(el => $(el)[0]['checked']).includes(false),
      'The selected items are checked');
  });
});
