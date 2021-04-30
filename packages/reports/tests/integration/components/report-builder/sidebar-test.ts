import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { assertTooltipContent } from 'ember-tooltips/test-support';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type ReportBuilderSidebar from 'navi-reports/components/report-builder/sidebar';
import type { TestContext as Context } from 'ember-test-helpers';
import type DataStore from '@ember-data/store';
import type NaviMetadataService from 'navi-data/services/navi-metadata';

type ComponentArgs = ReportBuilderSidebar['args'];
interface TestContext extends Context, ComponentArgs {}

let MetadataService: NaviMetadataService, Store: DataStore;

const TEMPLATE = hbs`
<ReportBuilder::Sidebar
  @report={{this.report}}
  @disabled={{this.disabled}}
  @onBeforeAddItem={{this.onBeforeAddItem}}
  @lastAddedColumn={{this.lastAddedColumn}}
  @setTable={{this.setTable}}
/>`;

const getBreadcrumbs = () => findAll('.report-builder-sidebar__breadcrumb li').map((el) => el.textContent?.trim());

module('Integration | Component | report-builder/sidebar', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    MetadataService = this.owner.lookup('service:navi-metadata');
    Store = this.owner.lookup('service:store');
    await MetadataService.loadMetadata({ dataSourceName: 'bardOne' });

    this.report = Store.createRecord('report', {
      request: Store.createFragment('bard-request-v2/request', {
        table: 'tableA',
        dataSource: 'bardOne',
        limit: null,
        requestVersion: '2.0',
        filters: [],
        columns: [],
        sorts: [],
      }),
      visualization: {},
    });
    this.disabled = false;
    this.onBeforeAddItem = () => undefined;
    this.lastAddedColumn = undefined;
    this.setTable = () => undefined;
  });

  test('breadcrumb links', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert.deepEqual(
      getBreadcrumbs(),
      ['Data Sources', 'Bard One'],
      'The breadcrumb shows the current selected data source'
    );
    assert.dom('.report-builder-sidebar__source').hasText('Table A', 'The selected table is shown');

    await click(findAll('.report-builder-sidebar__breadcrumb li button')[1]);

    assert.deepEqual(getBreadcrumbs(), ['Data Sources'], 'The breadcrumb shows data sources');
    assert.dom('.report-builder-sidebar__source').hasText('Bard One', 'The selected table is shown');

    await click('.report-builder-sidebar__breadcrumb li button');
    assert.deepEqual(getBreadcrumbs(), [], 'No breadcrumbs are shown when picking data sources');
    assert.dom('.report-builder-sidebar__source').hasText('Data Sources', 'The selected table is shown');
  });

  test('it selects tables', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    this.setTable = (table) => {
      const networkTable = MetadataService.getById('table', 'network', 'bardOne');
      assert.deepEqual(table, networkTable, 'The network table is selected');
      this.report.request.setTableByMetadata(table);
    };
    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');

    assert.deepEqual(
      findAll('.report-builder-source-selector__source-name').map((el) => el.textContent?.trim()),
      ['Network', 'Protected Table', 'Table A', 'Table B', 'Table C'],
      'The available tables are listed'
    );
    await click('.report-builder-source-selector__source-button[data-source-name="Network"]');

    assert.deepEqual(getBreadcrumbs(), ['Data Sources', 'Bard One'], 'The breadcrumb shows the correct data source');

    assert.dom('.report-builder-sidebar__source').hasText('Network', 'The table is updated');
  });

  test('it selects dataSources', async function (this: TestContext, assert) {
    await render(TEMPLATE);
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });

    this.setTable = (table) => {
      const inventoryTable = MetadataService.getById('table', 'inventory', 'bardTwo');
      assert.deepEqual(table, inventoryTable, 'The inventory table is selected');
      this.report.request.setTableByMetadata(table);
    };
    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');

    assert.deepEqual(
      findAll('.report-builder-source-selector__source-name').map((el) => el.textContent?.trim()),
      ['Bard One', 'Bard Two', 'Elide One', 'Elide Two'],
      'The available dataSources are listed'
    );
    await click('.report-builder-source-selector__source-button[data-source-name="Bard Two"]');

    assert.deepEqual(getBreadcrumbs(), ['Data Sources'], 'The breadcrumb shows data sources');
    assert.dom('.report-builder-sidebar__source').hasText('Bard Two', 'The selected datasource is shown');

    assert.deepEqual(
      findAll('.report-builder-source-selector__source-name').map((el) => el.textContent?.trim()),
      ['Inventory'],
      'The available tables for the datasource are listed'
    );

    await click('.report-builder-source-selector__source-button[data-source-name="Inventory"]');

    assert.deepEqual(getBreadcrumbs(), ['Data Sources', 'Bard Two'], 'The breadcrumb show the selected data source');
    assert.dom('.report-builder-sidebar__source').hasText('Inventory', 'The table is updated');
  });

  test('it shows descriptions', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');

    await triggerEvent('.report-builder-source-selector__source-description', 'mouseenter');

    assertTooltipContent(assert, {
      contentString: 'Network, Product, and Property level data',
    });

    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');

    await triggerEvent('.report-builder-source-selector__source-description', 'mouseenter');

    assertTooltipContent(assert, {
      contentString: 'Interesting User Insights',
    });
  });
});
