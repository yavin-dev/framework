import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, click, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { assertTooltipContent } from 'ember-tooltips/test-support';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import type ReportBuilderSidebar from 'navi-reports/components/report-builder/sidebar';
import type { TestContext as Context } from 'ember-test-helpers';
import type DataStore from '@ember-data/store';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import { RequestOptions } from 'navi-data/adapters/facts/interface';

type ComponentArgs = ReportBuilderSidebar['args'];
interface TestContext extends Context, ComponentArgs {}

let MetadataService: NaviMetadataService, Store: DataStore;

const TEMPLATE = hbs`
<div style="position: relative; display: flex; flex: 1;">
  <ReportBuilder::Sidebar
    @isOpen={{this.isOpen}}
    @report={{this.report}}
    @disabled={{this.disabled}}
    @onCloseSidebar={{this.onCloseSidebar}}
    @lastAddedColumn={{this.lastAddedColumn}}
    @setTable={{this.setTable}}
  />
</div>
`;

const getBreadcrumbs = () => findAll('.report-builder-sidebar__breadcrumb li').map((el) => el.textContent?.trim());

module('Integration | Component | report-builder/sidebar', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);
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
    this.isOpen = true;
    this.onCloseSidebar = () => undefined;
    this.disabled = false;
    this.lastAddedColumn = undefined;
    this.setTable = () => undefined;
  });

  test('it opens and closes', async function (this: TestContext, assert) {
    this.set('isOpen', false);
    await render(TEMPLATE);
    assert.dom('.report-builder-sidebar__header').doesNotExist('The sidebar is hidden');

    this.set('isOpen', true);
    await animationsSettled();
    assert.dom('.report-builder-sidebar__header').exists('The sidebar is rendered');
  });

  test('header height does not change', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert.deepEqual(
      getBreadcrumbs(),
      ['Data Sources', 'Bard One'],
      'The breadcrumb shows the current selected data source'
    );
    const level2Height = (find('.report-builder-sidebar__header') as HTMLElement).offsetHeight;

    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');
    const level1Height = (find('.report-builder-sidebar__header') as HTMLElement).offsetHeight;

    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');
    const level0Height = (find('.report-builder-sidebar__header') as HTMLElement).offsetHeight;
    assert.deepEqual([level0Height, level1Height, level2Height], [57, 57, 57], 'The header height does not change');
  });

  test('breadcrumb links', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert.deepEqual(
      getBreadcrumbs(),
      ['Data Sources', 'Bard One'],
      'The breadcrumb shows the current selected data source'
    );
    assert.dom('.report-builder-sidebar__source').hasText('Table A', 'The selected table is shown');

    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');

    assert.deepEqual(getBreadcrumbs(), ['Data Sources'], 'The breadcrumb shows data sources');
    assert.dom('.report-builder-sidebar__source').hasText('Bard One', 'The selected table is shown');

    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');
    assert.deepEqual(getBreadcrumbs(), ['Select A Datasource'], 'Select datasource hint is shown');
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
      findAll(
        '.report-builder-source-selector-list--suggested .report-builder-source-selector__source-name'
      ).map((el) => el.textContent?.trim()),
      ['Network'],
      'The suggested tables are listed'
    );
    assert.deepEqual(
      findAll('.report-builder-source-selector-list--all .report-builder-source-selector__source-name').map((el) =>
        el.textContent?.trim()
      ),
      ['Network', 'Protected Table', 'Table A', 'Table B', 'Table C'],
      'All available tables are listed'
    );
    await click('.report-builder-source-selector__source-button[data-source-name="Network"]');
    await animationsSettled();

    assert.deepEqual(getBreadcrumbs(), ['Data Sources', 'Bard One'], 'The breadcrumb shows the correct data source');

    assert.dom('.report-builder-sidebar__source').hasText('Network', 'The table is updated');
  });

  test('it selects dataSources', async function (this: TestContext, assert) {
    assert.expect(9);
    await render(TEMPLATE);
    const originalLoadMetadata = MetadataService.loadMetadata;
    MetadataService.loadMetadata = function loadMetadata({ dataSourceName }: RequestOptions) {
      assert.strictEqual(dataSourceName, 'bardTwo', 'The sidebar loads metadata for selected dataSource');
      assert.notOk(
        MetadataService['loadedDataSources'].has(dataSourceName!),
        'The metadata service did not have the selected dataSource preloaded'
      );
      return originalLoadMetadata.call(MetadataService, ...arguments);
    };

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
    await animationsSettled();

    assert.deepEqual(getBreadcrumbs(), ['Data Sources'], 'The breadcrumb shows data sources');
    assert.dom('.report-builder-sidebar__source').hasText('Bard Two', 'The selected datasource is shown');

    assert.deepEqual(
      findAll('.report-builder-source-selector__source-name').map((el) => el.textContent?.trim()),
      ['Inventory'],
      'The available tables for the datasource are listed'
    );

    await click('.report-builder-source-selector__source-button[data-source-name="Inventory"]');
    await animationsSettled();

    assert.deepEqual(getBreadcrumbs(), ['Data Sources', 'Bard Two'], 'The breadcrumb show the selected data source');
    assert.dom('.report-builder-sidebar__source').hasText('Inventory', 'The table is updated');
  });

  test('it shows descriptions', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');
    await animationsSettled();

    await triggerEvent('.report-builder-source-selector__source-description', 'mouseenter');

    assertTooltipContent(assert, {
      contentString: 'Network, Product, and Property level data',
    });

    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');
    await animationsSettled();

    await triggerEvent('.report-builder-source-selector__source-description', 'mouseenter');

    assertTooltipContent(assert, {
      contentString: 'Interesting User Insights',
    });
  });
});
