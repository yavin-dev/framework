import { helper as buildHelper } from '@ember/component/helper';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import $ from 'jquery';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { A as arr } from '@ember/array';

let Metric, Request;

module('Integration | Component | metric filter config', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.owner.register('helper:update-report-action', buildHelper(() => {}), { instantiate: false });

    Metric = {
      metric: { id: 'testMetric', name: 'Test Metric' },
      parameters: {
        param: 'foo'
      },
      canonicalName: 'testMetric(foo)'
    };

    Request = {
      metrics: arr([
        {
          metric: { id: 'testMetric' },
          parameters: { param: 'foo' },
          canonicalName: 'testMetric(foo)'
        },
        {
          metric: { id: 'testMetric' },
          parameters: { param: 'bar' },
          canonicalName: 'testMetric(bar)'
        },
        {
          metric: { id: 'testMetric' },
          parameters: { param: 'baz' },
          canonicalName: 'testMetric(baz)'
        },
        {
          metric: { id: 'testMetric1' },
          parameters: { param: 'fooz' },
          canonicalName: 'testMetric1(fooz)'
        }
      ]),
      having: arr([
        {
          metric: {
            metric: { id: 'testMetric' },
            parameters: { param: 'foo' },
            canonicalName: 'testMetric(foo)'
          }
        }
      ])
    };

    this.set('metric', Metric);
    this.set('request', Request);
    this.set('paramClicked', () => {});

    await render(hbs`
      {{metric-filter-config
        metric=metric
        request=request
        paramClicked=paramClicked
      }}
    `);
  });

  test('it renders', async function(assert) {
    assert.expect(4);

    assert
      .dom('.metric-filter-config__dropdown-trigger .metric-filter-config__trigger-icon')
      .isVisible('The trigger icon is rendered');

    await clickTrigger('.metric-filter-config__dropdown-trigger');

    assert.dom('.metric-filter-config__dropdown-container').isVisible('The dropdown renders on click');

    assert.dom('.metric-filter-config__header').hasText('param (2)', 'The parameter name is rendered as the header');

    assert.deepEqual(
      findAll('.metric-filter-config__item').map(el => el.textContent.trim()),
      ['bar', 'baz'],
      'The parameter excluding the selected param in the request is an item in the dropdown'
    );
  });

  test('click action', async function(assert) {
    assert.expect(2);

    this.set('paramClicked', (param, paramValue) => {
      assert.equal(param, 'param', 'The type of parameter is passed to the action');

      assert.equal(paramValue, 'bar', 'The clicked param is passed to the action');
    });

    await clickTrigger('.metric-filter-config__dropdown-trigger');
    await click($('.metric-filter-config__item:contains(bar)')[0]);
  });

  test('metric parameters already in filter', async function(assert) {
    assert.expect(1);

    set(
      Request,
      'having',
      arr([
        {
          metric: {
            metric: { id: 'testMetric' },
            canonicalName: 'testMetric(foo)'
          }
        },
        {
          metric: {
            metric: { id: 'testMetric' },
            canonicalName: 'testMetric(bar)'
          }
        }
      ])
    );

    this.set('request', Request);
    await clickTrigger('.metric-filter-config__dropdown-trigger');
    assert.deepEqual(
      findAll('.metric-filter-config__item').map(el => el.textContent.trim()),
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
            metric: { id: 'testMetric' },
            canonicalName: 'testMetric(foo)'
          }
        },
        {
          metric: {
            metric: { id: 'testMetric' },
            canonicalName: 'testMetric(bar)'
          }
        },
        {
          metric: {
            metric: { id: 'testMetric' },
            canonicalName: 'testMetric(baz)'
          }
        }
      ])
    );

    this.set('request', Request);

    assert
      .dom('.metric-filter-config')
      .isNotVisible('the component is not rendered when no other metric parameters exist');
  });
});
