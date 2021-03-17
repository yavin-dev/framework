import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerKeyEvent, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type { TestContext as Context } from 'ember-test-helpers';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';
import type NaviColumnConfigBase from 'navi-reports/components/navi-column-config/base';
import type FragmentFactory from 'navi-core/services/fragment-factory';

const TEMPLATE = hbs`
<NaviColumnConfig::Base
  @column={{this.column}}
  @cloneColumn={{optional this.cloneColumn}}
  @onAddFilter={{optional this.onAddFilter}}
  @onUpsertSort={{optional this.onUpsertSort}}
  @onRemoveSort={{optional this.onRemoveSort}}
  @onRenameColumn={{optional this.onRenameColumn}}
  @onUpdateColumnParam={{optional this.onUpdateColumnParam}}
/>`;

type ComponentArgs = NaviColumnConfigBase['args'];
interface TestContext extends Context, ComponentArgs {
  request: RequestFragment;
  fragmentFactory: FragmentFactory;
}

module('Integration | Component | navi-column-config/base', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.fragmentFactory = this.owner.lookup('service:fragment-factory');
    const store = this.owner.lookup('service:store');
    this.request = store.createFragment('bard-request-v2/request', {
      table: 'tableA',
      dataSource: 'bardOne',
      columns: [],
      sorts: [],
      filters: [],
    });

    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('it renders', async function (this: TestContext, assert) {
    this.set('column', {
      isFiltered: false,
      fragment: this.fragmentFactory.createColumn('dimension', 'bardOne', 'property'),
    });

    await render(TEMPLATE);

    assert
      .dom('.navi-column-config-base__api-column-name')
      .hasText(this.column.fragment.columnMetadata.id, 'NaviColumnConfig::Base renders dimension API column name');

    assert
      .dom('.navi-column-config-base__api-column-name')
      .hasAttribute(
        'title',
        `API Column: ${this.column.fragment.columnMetadata.id}`,
        'NaviColumnConfig::Base renders a title attribute for the API Column name'
      );

    this.set('column', {
      fragment: this.fragmentFactory.createColumn('metric', 'bardOne', 'adClicks'),
    });

    assert
      .dom('.navi-column-config-base__api-column-name')
      .hasText(this.column.fragment.columnMetadata.id, 'NaviColumnConfig::Base renders metric API column name');

    this.set('column', {
      fragment: this.fragmentFactory.createColumn('timeDimension', 'bardOne', 'network.dateTime'),
    });

    assert
      .dom('.navi-column-config-base__api-column-name')
      .hasText(
        'network.dateTime',
        'NaviColumnConfig::Base has a special case for rendering the dateTime API column name'
      );
  });

  test('it supports action', async function (this: TestContext, assert) {
    assert.expect(8);
    const metricBase = { type: 'metric' as const, field: 'revenue', source: 'bardOne', parameters: {} };
    const fragment = this.request.addColumn(metricBase);
    this.column = {
      fragment,
      isFiltered: false,
      isRequired: false,
    };

    this.onRenameColumn = (newName) => {
      assert.step('onRenameColumn');
      assert.equal(newName, 'Some other value', 'onRenameColumn action is called with new column name');
    };
    this.cloneColumn = () => assert.step('cloneColumn');
    this.onAddFilter = () => assert.step('onAddFilter');
    this.onUpsertSort = () => assert.step('onUpsertSort');
    this.onRemoveSort = () => assert.step('onRemoveSort');
    await render(TEMPLATE);

    const columnNameInput = '.navi-column-config-base__column-name input';
    assert
      .dom(columnNameInput)
      .hasProperty('placeholder', 'Revenue', "Column Name field has placeholder of column's display name");
    await fillIn(columnNameInput, 'Some other value');
    await triggerKeyEvent(columnNameInput, 'keyup', 13);

    await click('.navi-column-config-base__clone-icon');
    await click('.navi-column-config-base__filter-icon');
    await click('.navi-column-config-base__sort-icon');
    this.request.addSort({ ...metricBase, direction: 'desc' });
    await click('.navi-column-config-base__sort-icon');

    assert.verifySteps(
      ['onRenameColumn', 'cloneColumn', 'onAddFilter', 'onUpsertSort', 'onRemoveSort'],
      'actions are performed in the order they are called'
    );
  });
});
