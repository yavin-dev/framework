import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import { CellRendererArgs } from 'navi-core/components/navi-table-cell-renderer';
import StoreService from 'ember-data/store';
import { TableColumn } from 'navi-core/components/navi-visualizations/table';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

const TEMPLATE = hbs`
<NaviCellRenderers::Dimension
  @data={{this.data}}
  @column={{this.column}}
  @request={{this.request}}
/>`;

const data: CellRendererArgs['data'] = {
  'os(field=id)': 'BlackBerry',
  'os(field=desc)': 'BlackBerry OS'
};

interface TestContext extends Context {
  column: TableColumn;
  data: Record<string, string>;
  request: RequestFragment;
}

module('Integration | Component | cell renderers/dimension', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;

    this.set('data', data);
    this.set(
      'request',
      store.createFragment('bard-request-v2/request', {
        columns: [
          { type: 'dimension', field: 'os', parameters: { field: 'id' }, source: 'bardOne' },
          { type: 'dimension', field: 'os', parameters: { field: 'desc' }, source: 'bardOne' }
        ],
        filters: [],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'bardOne',
        table: 'network'
      })
    );

    const fragment = this.request.columns.objectAt(0) as ColumnFragment;
    const column: TableColumn = {
      fragment,
      attributes: {},
      columnId: fragment.cid
    };
    this.set('column', column);
  });

  test('dimension renders given field', async function(this: TestContext, assert) {
    assert.expect(3);
    await render(TEMPLATE);

    assert.dom('.table-cell-content').isVisible('The dimension cell renderer is visible');

    assert.dom('.table-cell-content').hasText('BlackBerry', 'The dimension cell renders the given field');

    const fragment = this.request.columns.objectAt(1) as ColumnFragment;
    const column: TableColumn = {
      fragment,
      attributes: {},
      columnId: 'cid_osDesc'
    };
    this.set('column', column);

    assert
      .dom('.table-cell-content')
      .hasText('BlackBerry OS', 'The dimension cell switches to the other field based on the parameter');
  });

  test('dimension renders no value with dashes correctly', async function(assert) {
    assert.expect(1);

    this.set('data', {});

    await render(TEMPLATE);

    assert
      .dom('.table-cell-content')
      .hasText('--', 'The dimension cell renders correctly when present description field is not present');
  });
});
