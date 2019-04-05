import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import Helper from '@ember/component/helper';
import { A as arr } from '@ember/array';

let Request = {
  metrics: arr([]),
  having: arr([])
};

module('Integration | Component | filter-builders/metric', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('helper:update-report-action', Helper.helper(() => {}), {
      instantiate: false
    });

    this.owner.register(
      'component:mock/values-component',
      Component.extend({
        classNames: 'mock-value-component'
      })
    );
  });

  test('displayName', async function(assert) {
    assert.expect(2);

    //check display name for metric with params
    let filter = {
      subject: {
        metric: { longName: 'metric-with-params' },
        parameters: {
          foo: 'bar',
          bar: 'baz'
        }
      },
      operator: {
        id: 'in',
        longName: 'Equals',
        valuesComponent: 'mock/values-component'
      },
      values: [1, 2, 3]
    };

    this.set('filter', filter);
    this.set('request', Request);
    await render(hbs`{{filter-builders/metric filter=filter request=request}}`);

    assert
      .dom('.filter-builder__subject')
      .hasText(
        'metric-with-params (bar,baz)',
        "Subject's long name displayed in filter builder includes the metric long name and the parameters"
      );

    //check display name for metric without params
    filter = {
      subject: {
        metric: { longName: 'metric-without-params' },
        parameters: {}
      },
      operator: {
        id: 'in',
        longName: 'Equals',
        valuesComponent: 'mock/values-component'
      },
      values: [1, 2, 3]
    };

    this.set('filter', filter);

    assert
      .dom('.filter-builder__subject')
      .hasText('metric-without-params', "Only the subject's long name is displayed when the metric has no parameters");
  });
});
