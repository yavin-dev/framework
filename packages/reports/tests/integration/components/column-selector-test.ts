import { click, fillIn, findAll, render, triggerEvent } from '@ember/test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { TestContext as Context } from 'ember-test-helpers';
import { Server } from 'miragejs';
import hbs from 'htmlbars-inline-precompile';
import FragmentFactory from 'navi-core/services/fragment-factory';
import ColumnMetadataModel from 'navi-data/models/metadata/column';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { module, test } from 'qunit';
import config from 'ember-get-config';
//@ts-ignore
import { assertTooltipRendered, assertTooltipNotRendered, assertTooltipContent } from 'ember-tooltips/test-support';
import ColumnSelector from 'navi-reports/components/column-selector';

type ComponentArgs = ColumnSelector['args'];
interface TestContext extends Context, ComponentArgs {
  server: Server;
  metadataService: NaviMetadataService;
  factoryService: FragmentFactory;
}

const TEMPLATE = hbs`
  <ColumnSelector
    @title={{this.title}}
    @allColumns={{this.allColumns}}
    @selectedColumns={{this.selectedColumns}}
    @onAddColumn={{this.onAddColumn}}
    @onAddFilter={{this.onAddFilter}}
    class="report-builder__metric-selector"
  />
`;
module('Integration | Component | column-selector', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function (this: TestContext) {
    this.factoryService = this.owner.lookup('service:fragment-factory');
    this.metadataService = this.owner.lookup('service:navi-metadata');
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });

    const dimensions = this.metadataService.all('dimension', 'bardOne').toArray();
    const selectedColumns = [this.factoryService.createColumnFromMeta(dimensions[0])];
    this.set('allColumns', dimensions);
    this.set('selectedColumns', selectedColumns);
    this.set('title', 'My Awesome Columns');
    this.set('onAddColumn', () => null);
    this.set('onAddFilter', () => null);
  });

  test('it renders', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert.dom('.column-selector__title').hasText('My Awesome Columns', '`column-selector renders a title correctly');
    const groups = findAll('.grouped-list__group-header').map((e) => e?.textContent?.trim());
    assert.deepEqual(groups, ['Asset (4)', 'test (27)'], '`column-selector` renders column groups correctly');

    await click(findAll('.grouped-list__group-header')[0]);
    const groupColumns = findAll('.column-selector__column').map((e) => e?.textContent?.trim());
    assert.deepEqual(
      groupColumns,
      ['EventId', 'Parent Event Id', 'Product Family', 'Property'],
      '`column-selector` expands a column group correctly'
    );
  });

  test('search', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert.dom('.column-selector__column').doesNotExist('All column groups are collapsed');
    await fillIn('.column-selector__search-input', 'age');

    const groups = findAll('.grouped-list__group-header').map((e) => e?.textContent?.trim());
    assert.deepEqual(groups, ['test (1)'], '`column-selector` renders search column groups correctly');

    const groupColumns = findAll('.column-selector__column').map((e) => e?.textContent?.trim());
    assert.deepEqual(groupColumns, ['Age'], '`column-selector` expands search column group correctly');

    await fillIn('.column-selector__search-input', 'not a column');
    assert
      .dom('.grouped-list__group-header')
      .doesNotExist('`column-selector` does not show column groups when no search column is found');
    assert
      .dom('.column-selector__column')
      .doesNotExist('`column-selector` does not show columns when no search column is found');
    assert.dom('.column-selector__no-match').exists('`column-selector` shows a message when no search column is found');
  });

  test('onAddColumn', async function (this: TestContext, assert) {
    assert.expect(1);

    this.set('onAddColumn', (column: ColumnMetadataModel) => {
      assert.equal(column.name, 'Age', '`column-selector` calls `onAddColumn` when column is clicked');
    });

    await render(TEMPLATE);
    await fillIn('.column-selector__search-input', 'age');
    await click('.column-selector__add-column-btn');
  });

  test('onAddFilter', async function (this: TestContext, assert) {
    assert.expect(1);

    this.set('onAddFilter', (column: ColumnMetadataModel) => {
      assert.equal(column.name, 'Age', '`column-selector` calls `onAddFilter` when filter is clicked');
    });

    await render(TEMPLATE);
    await fillIn('.column-selector__search-input', 'age');
    await click('.column-selector__add-filter-btn');
  });

  test('tooltip', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assertTooltipNotRendered(assert);
    this.server.get(`${config.navi.dataSources[0].uri}/v1/dimensions/age`, function () {
      return {
        category: 'test',
        name: 'age',
        longName: 'Age',
        type: 'string',
        description: 'my description',
      };
    });

    await fillIn('.column-selector__search-input', 'age');
    await triggerEvent('.column-selector__column-info', 'mouseenter');

    assertTooltipRendered(assert);
    assertTooltipContent(assert, {
      contentString: 'my description',
    });
  });
});
