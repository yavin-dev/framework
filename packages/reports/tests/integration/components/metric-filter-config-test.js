import { moduleForComponent, test } from 'ember-qunit';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import Ember from 'ember';

let Metric, Request;

moduleForComponent('metric-filter-config', 'Integration | Component | metric filter config', {
  integration: true,
  beforeEach() {
    this.register('helper:report-action', Ember.Helper.helper(() => {}), { instantiate: false });

    Metric = {
      metric: { name: 'testMetric', longName: 'Test Metric' },
      parameters: {
        param: 'foo'
      },
      canonicalName: 'testMetric(foo)'
    }

    Request = {
      metrics: Ember.A([{
        metric: { name: 'testMetric' },
        parameters: { param: 'foo' },
        canonicalName: 'testMetric(foo)'
      },{
        metric: { name: 'testMetric' },
        parameters: { param: 'bar' },
        canonicalName: 'testMetric(bar)'
      },{
        metric: { name: 'testMetric' },
        parameters: { param: 'baz' },
        canonicalName: 'testMetric(baz)'
      },{
        metric: { name: 'testMetric1' },
        parameters: { param: 'fooz' },
        canonicalName: 'testMetric1(fooz)'
      }])
    };

  }
});

test('it renders', function(assert) {
  assert.expect(4);

  this.set('metric', Metric);
  this.set('request', Request);
  this.set('paramClicked', () => {});

  this.render(hbs`
    {{metric-filter-config
      metric=metric
      request=request
      paramClicked=paramClicked
    }}
  `);

  assert.ok(this.$('.metric-filter-config__dropdown-trigger .metric-filter-config__trigger-icon').is(':visible'),
    'The trigger icon is rendered');

  run(() => clickTrigger('.metric-filter-config__dropdown-trigger'));

  assert.ok($('.metric-filter-config__dropdown-container').is(':visible'),
    'The dropdown renders on click');

  assert.equal($('.metric-filter-config__header').text().trim(),
    'param (2)',
    'The parameter name is rendered as the header');

  assert.deepEqual($('.metric-filter-config__item').toArray().map(el => $(el).text().trim()),
    [ 'bar', 'baz' ],
    'The parameter excluding the selected param in the request is an item in the dropdown');
});

test('click action', function(assert) {
  assert.expect(2);

  this.set('metric', Metric);
  this.set('request', Request);
  this.set('paramClicked', (param, paramValue) => {
    assert.equal(param,
      'param',
      'The type of parameter is passed to the action');

    assert.equal(paramValue,
      'bar',
      'The clicked param is passed to the action');
  });

  this.render(hbs`
    {{metric-filter-config
      metric=metric
      request=request
      paramClicked=paramClicked
    }}
  `);

  run(() => {
    clickTrigger('.metric-filter-config__dropdown-trigger');
    $('.metric-filter-config__item:contains(bar)').click();
  });
});
