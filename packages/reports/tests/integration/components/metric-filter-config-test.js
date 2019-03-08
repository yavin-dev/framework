import { helper as buildHelper } from '@ember/component/helper';
import { moduleForComponent, test } from 'ember-qunit';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';
import { set } from '@ember/object';
import { A as arr } from '@ember/array';

let Metric, Request;

moduleForComponent('metric-filter-config', 'Integration | Component | metric filter config', {
  integration: true,
  beforeEach() {
    this.register('helper:update-report-action', buildHelper(() => {}), { instantiate: false });

    Metric = {
      metric: { name: 'testMetric', longName: 'Test Metric' },
      parameters: {
        param: 'foo'
      },
      canonicalName: 'testMetric(foo)'
    };

    Request = {
      metrics: arr([
        {
          metric: { name: 'testMetric' },
          parameters: { param: 'foo' },
          canonicalName: 'testMetric(foo)'
        },
        {
          metric: { name: 'testMetric' },
          parameters: { param: 'bar' },
          canonicalName: 'testMetric(bar)'
        },
        {
          metric: { name: 'testMetric' },
          parameters: { param: 'baz' },
          canonicalName: 'testMetric(baz)'
        },
        {
          metric: { name: 'testMetric1' },
          parameters: { param: 'fooz' },
          canonicalName: 'testMetric1(fooz)'
        }
      ]),
      having: arr([
        {
          metric: {
            metric: { name: 'testMetric' },
            parameters: { param: 'foo' },
            canonicalName: 'testMetric(foo)'
          }
        }
      ])
    };

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
  }
});

test('it renders', function(assert) {
  assert.expect(4);

  assert.ok(
    this.$('.metric-filter-config__dropdown-trigger .metric-filter-config__trigger-icon').is(':visible'),
    'The trigger icon is rendered'
  );

  run(() => clickTrigger('.metric-filter-config__dropdown-trigger'));

  assert.ok($('.metric-filter-config__dropdown-container').is(':visible'), 'The dropdown renders on click');

  assert.equal(
    $('.metric-filter-config__header')
      .text()
      .trim(),
    'param (2)',
    'The parameter name is rendered as the header'
  );

  assert.deepEqual(
    $('.metric-filter-config__item')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['bar', 'baz'],
    'The parameter excluding the selected param in the request is an item in the dropdown'
  );
});

test('click action', function(assert) {
  assert.expect(2);

  this.set('paramClicked', (param, paramValue) => {
    assert.equal(param, 'param', 'The type of parameter is passed to the action');

    assert.equal(paramValue, 'bar', 'The clicked param is passed to the action');
  });

  run(() => {
    clickTrigger('.metric-filter-config__dropdown-trigger');
    $('.metric-filter-config__item:contains(bar)').click();
  });
});

test('metric parameters already in filter', function(assert) {
  assert.expect(1);

  set(
    Request,
    'having',
    arr([
      {
        metric: {
          metric: { name: 'testMetric' },
          canonicalName: 'testMetric(foo)'
        }
      },
      {
        metric: {
          metric: { name: 'testMetric' },
          canonicalName: 'testMetric(bar)'
        }
      }
    ])
  );

  this.set('request', Request);
  run(() => clickTrigger('.metric-filter-config__dropdown-trigger'));
  assert.deepEqual(
    $('.metric-filter-config__item')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['baz'],
    'The parameter list excludes the filters in the request'
  );
});

test('no other metric parameters', function(assert) {
  assert.expect(1);

  set(
    Request,
    'having',
    arr([
      {
        metric: {
          metric: { name: 'testMetric' },
          canonicalName: 'testMetric(foo)'
        }
      },
      {
        metric: {
          metric: { name: 'testMetric' },
          canonicalName: 'testMetric(bar)'
        }
      },
      {
        metric: {
          metric: { name: 'testMetric' },
          canonicalName: 'testMetric(baz)'
        }
      }
    ])
  );

  this.set('request', Request);

  assert.notOk(
    this.$('.metric-filter-config').is(':visible'),
    'the component is not rendered when no other metric parameters exist'
  );
});
