import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { TestContext as Context } from 'ember-test-helpers';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import StoreService from '@ember-data/store';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type { TableColumn } from 'navi-core/components/navi-visualizations/table';
import type NaviTableCellRenderer from 'navi-core/components/navi-table-cell-renderer';
import type ColumnFragment from 'navi-core/models/fragments/column';

type ComponentArgs = NaviTableCellRenderer['args'];

interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | navi table cell renderer', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata({ dataSourceName: 'bardOne' });

    const store = this.owner.lookup('service:store') as StoreService;
    this.request = store.createFragment('request', {
      columns: [{ type: 'metric', field: 'uniqueIdentifier', parameters: {}, source: 'bardOne' }],
      filters: [],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'bardOne',
      table: 'network',
    });
  });

  test('it renders the correct cell renderer', async function (this: TestContext, assert) {
    const fragment = this.request.columns.objectAt(0) as ColumnFragment;
    const column: TableColumn = {
      fragment,
      attributes: {},
      sortDirection: 'none',
      columnId: fragment.cid,
    };
    this.set('column', column);

    this.set('data', {
      uniqueIdentifier: 12,
    });

    this.set('request', {});

    await render(hbs`<NaviTableCellRenderer
      @column={{this.column}}
      @data={{this.data}}
      @request={{this.request}}
     />`);

    assert.dom('.table-cell-content').hasText('12', 'renders metric value');
    assert.dom('.table-cell-content').hasClass('metric', 'renders metric cell-formatter');

    this.set('column', {
      fragment: { type: 'dimension', canonicalName: 'foo(field=id)' },
      attributes: {},
    });

    this.set('data', {
      'foo(field=id)': 'hi',
    });

    assert.dom('.table-cell-content').hasText('hi', 'renders dimension value');
    assert.dom('.table-cell-content').hasClass('dimension', 'renders using dimension cell-formatter');

    this.set('column', {
      fragment: { type: 'timeDimension', parameters: { grain: 'day' }, canonicalName: 'tableName.dateTime(grain=day)' },
      attributes: {},
    });

    this.set('data', {
      'tableName.dateTime(grain=day)': '2012-05-12T00:00:00',
    });

    assert.dom('.table-cell-content').hasText('05/12/2012', 'renders time-dimension value');
    assert.dom('.table-cell-content').hasClass('time-dimension', 'renders using date-time cell-formatter');
  });
});
