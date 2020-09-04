import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { merge } from 'lodash-es';
import { CellRendererArgs } from 'navi-core/components/navi-table-cell-renderer';
import StoreService from 'ember-data/store';
import { TableColumn } from 'navi-core/components/navi-visualizations/table';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

const TEMPLATE = hbs`
  <NaviCellRenderers::Metric
    @data={{this.data}}
    @column={{this.column}}
    @request={{this.request}}
  />`;

const data: CellRendererArgs['data'] = {
  uniqueIdentifier: 172933788
};

interface TestContext extends Context {
  column: TableColumn;
  data: Record<string, string>;
  request: RequestFragment;
}

module('Integration | Component | cell renderers/metric', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;

    this.set('data', data);
    this.set(
      'request',
      store.createFragment('bard-request-v2/request', {
        columns: [{ type: 'metric', field: 'uniqueIdentifier', parameters: {}, source: 'bardOne' }],
        filters: [],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'dummy',
        table: 'network'
      })
    );

    const fragment = this.request.columns.objectAt(0) as ColumnFragment;
    const column: TableColumn = {
      fragment,
      attributes: {},
      columnId: 0
    };
    this.set('column', column);
  });

  test('it renders', async function(assert) {
    assert.expect(2);
    await render(TEMPLATE);

    assert.dom('.table-cell-content').isVisible('The metric cell renderer is visible');
    assert.dom('.table-cell-content').hasText('172933788', 'The metric cell renders the value with commas correctly');
  });

  test('metric renders zero value correctly', async function(assert) {
    assert.expect(1);

    this.set('data', { uniqueIdentifier: 0 });

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('0', 'The metric cell renders the zero value correctly');
  });

  test('metric renders values > 100 correctly', async function(assert) {
    assert.expect(1);

    this.set('data', { uniqueIdentifier: 12345678 });

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('12345678', 'The metric cell renders the decimal value correctly');
  });

  test('metric renders decimal value between 1 and 100 correctly', async function(assert) {
    assert.expect(1);

    this.set('data', { uniqueIdentifier: 99 });

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('99', 'The metric cell renders the decimal value between 1 and 100 correctly');
  });

  test('metric renders decimal value between 0.0001 and 1 correctly', async function(assert) {
    assert.expect(1);
    this.set('data', { uniqueIdentifier: 0.001234 });

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('0.001234', 'The metric cell renders the decimal value between 0.0001 and 1 correctly');
  });

  test('metric renders decimal value less than 0.0001 correctly', async function(assert) {
    assert.expect(1);
    this.set('data', { uniqueIdentifier: 0.00001234 });

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('0.00001234', 'The metric cell renders the decimal value less than 0.0001 correctly');
  });

  test('metric renders null value correctly', async function(assert) {
    assert.expect(1);

    this.set('data', { uniqueIdentifier: null });
    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('--', 'The metric cell renders the null value with -- correctly');
  });

  test('render value based on column format', async function(this: TestContext, assert) {
    assert.expect(1);

    this.set('column', merge({}, this.column, { attributes: { format: '$0,0[.]00' } }));
    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('$172,933,788', 'The metric cell renders the value with format correctly');
  });
});
