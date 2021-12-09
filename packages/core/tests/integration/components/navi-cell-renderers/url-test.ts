import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import { CellRendererArgs } from 'navi-core/components/navi-table-cell-renderer';
import StoreService from 'ember-data/store';
import { TableColumn } from 'navi-core/components/navi-visualizations/table';
import RequestFragment from 'navi-core/models/request';
import ColumnFragment from 'navi-core/models/request/column';

const TEMPLATE = hbs`
<NaviCellRenderers::Url
  @data={{this.data}}
  @column={{this.column}}
  @request={{this.request}}
/>`;

const data: CellRendererArgs['data'] = {
  'urlDim(field=id)': 'https://example.com',
};

interface TestContext extends Context {
  column: TableColumn;
  data: Record<string, string>;
  request: RequestFragment;
}

module('Integration | Component | cell renderers/url', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;

    this.set('data', data);
    this.set(
      'request',
      store.createFragment('request', {
        columns: [{ type: 'dimension', field: 'urlDim', parameters: { field: 'id' }, source: 'bardOne' }],
        filters: [],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'bardOne',
        table: 'network',
      })
    );

    const fragment = this.request.columns.objectAt(0) as ColumnFragment;
    const column: TableColumn = {
      fragment,
      attributes: {},
      sortDirection: null,
      columnId: fragment.cid,
    };
    this.set('column', column);
  });

  test('it renders a link', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert.dom('.table-cell-content').isVisible('The url cell renderer is visible');

    assert.dom('.table-cell-content').hasText('https://example.com', 'The url cell renders the correct text');

    assert
      .dom('.table-cell-content a')
      .hasAttribute('href', 'https://example.com', 'The anchor element has the correct href attribute');
  });

  test('dimension renders no value with dashes correctly', async function (assert) {
    this.set('data', {});

    await render(TEMPLATE);

    assert.dom('.table-cell-content').hasText('--', 'The url cell renders correctly when value is not present');

    assert.dom('.table-cell-content a').doesNotExist('The anchor element is not rendered');
  });
});
