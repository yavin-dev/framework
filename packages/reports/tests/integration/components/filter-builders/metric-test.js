import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import Helper from '@ember/component/helper';

let Request = {
  table: '',
  dataSource: '',
  requestVersion: '2.0',
  limit: null,
  columns: [],
  filters: [],
  sorts: []
};

module('Integration | Component | filter-builders/metric', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.owner.register(
      'helper:update-report-action',
      Helper.helper(() => {}),
      {
        instantiate: false
      }
    );

    this.owner.register(
      'component:mock/values-component',
      Component.extend({
        classNames: 'mock-value-component',
        layout: hbs`<div>metric values</div>`
      })
    );

    //check display name for metric with params
    const filter = {
      field: 'metric-with-params',
      type: 'metric',
      parameters: {
        foo: 'bar',
        bar: 'baz'
      },
      columnMetadata: {
        name: 'metric-with-params'
      },
      operator: {
        id: 'eq',
        name: 'Equals',
        valuesComponent: 'mock/values-component'
      },
      values: [1, 2, 3]
    };

    this.set('filter', filter);
    this.set('request', Request);
    await render(
      hbs`<FilterBuilders::Metric @filter={{this.filter}} @request={{this.request}} @isCollapsed={{this.isCollapsed}} @requestFragment={{this.filter}} />`
    );
  });

  test('displayName', async function(assert) {
    assert.expect(2);

    assert
      .dom('.filter-builder__subject')
      .hasText(
        'metric-with-params (bar,baz)',
        "Subject's long name displayed in filter builder includes the metric long name and the parameters"
      );

    //check display name for metric without params
    const filter = {
      type: 'metric',
      parameters: {},
      columnMetadata: {
        name: 'metric-without-params'
      },
      operator: {
        id: 'eq',
        name: 'Equals',
        valuesComponent: 'mock/values-component'
      },
      values: [1, 2, 3]
    };

    this.set('filter', filter);

    assert
      .dom('.filter-builder__subject')
      .hasText('metric-without-params', "Only the subject's long name is displayed when the metric has no parameters");
  });

  test('collapsed', async function(assert) {
    assert.expect(1);

    this.set('isCollapsed', true);
    assert
      .dom('.filter-builder')
      .hasText('metric-with-params (bar,baz) equals metric values', 'Rendered correctly when collapsed');
  });
});
