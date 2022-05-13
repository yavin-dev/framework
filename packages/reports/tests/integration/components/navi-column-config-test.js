import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { getContext } from '@ember/test-helpers';
import { drag } from 'ember-sortable/test-support/helpers';

let Store, Metadata;

function addItem(type, item, dataSource, parameters = {}) {
  const self = getContext();
  const metadata = self.owner.lookup('service:navi-metadata').getById(type, item, dataSource);
  return self.report.request.addColumnFromMetaWithParams(metadata, parameters);
}

const TEMPLATE = hbs`
<NaviColumnConfig
  @lastAddedColumn={{this.lastAddedColumn}}
  @resetLastAddedColumn={{optional this.resetLastAddedColumn}}
  @report={{this.report}}
  @onAddColumn={{optional this.onAddColumn}}
  @onRemoveColumn={{optional this.onRemoveColumn}}
  @onAddFilter={{optional this.onAddFilter}}
  @onUpsertSort={{optional this.onUpsertSort}}
  @onRemoveSort={{optional this.onRemoveSort}}
  @onRenameColumn={{optional this.onRenameColumn}}
  @onReorderColumn={{optional this.onReorderColumn}}
  @onUpdateColumnParam={{optional this.onUpdateColumnParam}}
/>`;

module('Integration | Component | navi-column-config', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Metadata = this.owner.lookup('service:navi-metadata');
    Store = this.owner.lookup('service:store');

    await Metadata.loadMetadata({ dataSourceName: 'bardOne' });
    this.set(
      'report',
      Store.createRecord('report', {
        request: Store.createFragment('request', {
          table: 'tableA',
          dataSource: 'bardOne',
          columns: [],
          sorts: [],
          filters: [],
        }),
        visualization: {
          type: 'line-chart',
          version: 1,
          metadata: {
            axis: {
              y: {
                series: {
                  type: 'metric',
                  config: {
                    metrics: [{ metric: 'adClicks', parameters: {}, canonicalName: 'adClicks' }],
                  },
                },
              },
            },
          },
        },
      })
    );
  });

  test('it renders', async function (assert) {
    await render(hbs`<NaviColumnConfig @report={{this.report}} />`);
    await animationsSettled();
    assert.dom('.navi-column-config').exists('NaviColumnConfig renders');
  });

  test('time grain - switching and removing', async function (assert) {
    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'day' });
    await render(TEMPLATE);
    await animationsSettled();

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)'],
      'The date time column is initially added and set to day'
    );

    assert
      .dom('.navi-column-config-item__remove-icon')
      .doesNotHaveClass(
        'navi-column-config-item__remove-icon--disabled',
        'remove button of time dimension column does not have disabled class'
      );
    assert
      .dom('.navi-column-config-item__remove-icon')
      .isNotDisabled('remove button of time dimension column is not disabled');

    await click('.navi-column-config-item__name[title="Date Time (Day)"]');
    await clickTrigger('.navi-column-config-item__parameter'); // open the time grain dropdown
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-dropdown .ember-power-select-option').map((el) =>
        el.textContent.trim()
      ),
      ['Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year'],
      'The table time grains are passed correctly to the time grain column'
    );

    this.set('report.request.columns.firstObject.parameters', { grain: 'week' });
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (week)'],
      'The date time column is changed to week'
    );
  });

  test('metrics - adding', async function (assert) {
    assert.expect(2);

    await render(TEMPLATE);

    addItem('metric', 'adClicks', 'bardOne');
    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('metric', 'navClicks', 'bardOne');
    await animationsSettled();

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'Metrics are displayed after the date time column'
    );

    addItem('metric', 'adClicks', 'bardOne');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );
  });

  test('metrics - removing from start', async function (assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('metric', 'adClicks', 'bardOne');
    addItem('metric', 'navClicks', 'bardOne');
    addItem('metric', 'adClicks', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'All metrics are initially rendered'
    );

    this.report.request.columns.removeObject(this.report.request.metricColumns.firstObject);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Nav Link Clicks', 'Ad Clicks'],
      'A metric can be removed from the start'
    );
  });

  test('metrics - removing from end', async function (assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('metric', 'adClicks', 'bardOne');
    addItem('metric', 'navClicks', 'bardOne');
    addItem('metric', 'adClicks', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'All metrics are initially rendered'
    );

    this.report.request.columns.removeObject(this.report.request.metricColumns.lastObject);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'A metric can be removed from the end'
    );
  });

  test('dimensions - adding', async function (assert) {
    assert.expect(2);

    addItem('dimension', 'browser', 'bardOne');
    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('dimension', 'currency', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)'],
      'Dimensions are displayed after the date time column'
    );

    addItem('dimension', 'browser', 'bardOne');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)', 'Browser (id)'],
      'Duplicate dimensions can be added'
    );
  });

  test('dimensions - removing from start', async function (assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('dimension', 'browser', 'bardOne');
    addItem('dimension', 'currency', 'bardOne');
    addItem('dimension', 'browser', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)', 'Browser (id)'],
      'All dimensions are initially rendered'
    );

    this.report.request.columns.removeObject(this.report.request.dimensionColumns.firstObject);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Browser (id)', 'Currency (id)', 'Browser (id)'],
      'A dimension can be removed from the start'
    );
  });

  test('dimensions - removing from end', async function (assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('dimension', 'browser', 'bardOne');
    addItem('dimension', 'currency', 'bardOne');
    addItem('dimension', 'browser', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)', 'Browser (id)'],
      'All dimensions are initially rendered'
    );

    this.report.request.columns.removeObject(this.report.request.dimensionColumns.lastObject);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)'],
      'A dimension can be removed from the start'
    );
  });

  test('metrics and dimensions - adding', async function (assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)'],
      'The columns are all initially rendered'
    );

    addItem('dimension', 'browser', 'bardOne');
    addItem('metric', 'navClicks', 'bardOne');
    addItem('dimension', 'currency', 'bardOne');
    addItem('metric', 'adClicks', 'bardOne');
    addItem('dimension', 'productFamily', 'bardOne');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)', 'Product Family (id)', 'Nav Link Clicks', 'Ad Clicks'],
      'columns are grouped by type when added'
    );
  });

  test('Header config buttons - date dimension', async function (assert) {
    assert.expect(10);

    this.onAddColumn = () => assert.step('onAddColumn');
    this.onAddFilter = () => assert.step('onAddFilter');
    this.onUpsertSort = () => {
      assert.step('onUpsertSort');

      this.report.request.addSort({
        type: 'timeDimension',
        source: 'bardOne',
        field: 'tableA.dateTime',
        parameters: { grain: 'day' },
        direction: 'desc',
        cid: '1234567890',
      });
    };
    this.onRemoveSort = () => assert.step('onRemoveSort');
    this.onRemoveColumn = () => assert.step('onRemoveColumn');

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'day' });
    await render(TEMPLATE);
    await animationsSettled();
    await click('.navi-column-config-item__name[title="Date Time (Day)"]');
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)'],
      'Initial columns are added'
    );

    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Time dimension config has clone icon');
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Time dimension config has filter icon');
    await click('.navi-column-config-base__filter-icon');
    assert.dom('.navi-column-config-base__sort-icon').exists({ count: 1 }, 'Time dimension config has sort icon');
    await click('.navi-column-config-base__sort-icon');
    // sort is added
    await click('.navi-column-config-base__sort-icon');

    await click('.navi-column-config-item__remove-icon');

    assert.verifySteps(
      ['onAddColumn', 'onAddFilter', 'onUpsertSort', 'onRemoveSort', 'onRemoveColumn'],
      'actions are performed in the order they are called'
    );
  });

  test('Header config buttons - metric', async function (assert) {
    assert.expect(10);

    this.onAddColumn = () => assert.step('onAddColumn');
    this.onAddFilter = () => assert.step('onAddFilter');
    this.onUpsertSort = () => {
      assert.step('onUpsertSort');

      this.report.request.addSort({
        type: 'metric',
        source: 'bardOne',
        field: 'navClicks',
        parameters: {},
        direction: 'desc',
        cid: '1234567890',
      });
    };
    this.onRemoveSort = () => assert.step('onRemoveSort');
    this.onRemoveColumn = () => assert.step('onRemoveColumn');
    addItem('metric', 'navClicks', 'bardOne');
    await render(TEMPLATE);

    await click('.navi-column-config-item__name[title="Nav Link Clicks"]');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Nav Link Clicks'],
      'Initial columns are added'
    );

    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Metric config has clone icon');
    await click('.navi-column-config-base__clone-icon');

    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Metric config has filter icon');
    await click('.navi-column-config-base__filter-icon');

    assert.dom('.navi-column-config-base__sort-icon').exists({ count: 1 }, 'Time dimension config has sort icon');
    await click('.navi-column-config-base__sort-icon');
    // sort is added
    await click('.navi-column-config-base__sort-icon');

    await click('.navi-column-config-item__remove-icon');

    assert.verifySteps(
      ['onAddColumn', 'onAddFilter', 'onUpsertSort', 'onRemoveSort', 'onRemoveColumn'],
      'actions are performed in the order they are called'
    );
  });

  test('Header config buttons - dimension', async function (assert) {
    assert.expect(10);

    this.onAddColumn = () => assert.step('onAddColumn');
    this.onAddFilter = () => assert.step('onAddFilter');
    this.onUpsertSort = () => {
      assert.step('onUpsertSort');

      this.report.request.addSort({
        type: 'dimension',
        source: 'bardOne',
        field: 'browser',
        parameters: { field: 'id' },
        direction: 'desc',
        cid: '123457890',
      });
    };
    this.onRemoveSort = () => assert.step('onRemoveSort');
    this.onRemoveColumn = () => assert.step('onRemoveColumn');
    addItem('dimension', 'browser', 'bardOne');

    await render(TEMPLATE);

    await animationsSettled();
    await click('.navi-column-config-item__name[title="Browser (id)"]');
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Browser (id)'],
      'Initial columns are added'
    );

    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Dimension config has clone icon');
    await click('.navi-column-config-base__clone-icon');

    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Dimension config has filter icon');
    await click('.navi-column-config-base__filter-icon');

    assert.dom('.navi-column-config-base__sort-icon').exists({ count: 1 }, 'Time dimension config has sort icon');
    await click('.navi-column-config-base__sort-icon');
    // sort is added
    await click('.navi-column-config-base__sort-icon');

    await click('.navi-column-config-item__remove-icon');

    assert.verifySteps(
      ['onAddColumn', 'onAddFilter', 'onUpsertSort', 'onRemoveSort', 'onRemoveColumn'],
      'actions are performed in the order they are called'
    );
  });

  test('last added column', async function (assert) {
    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('dimension', 'browser', 'bardOne');
    addItem('metric', 'adClicks', 'bardOne');

    this.set('lastAddedColumn', null);

    await render(TEMPLATE);

    await animationsSettled();
    assert
      .dom('.navi-column-config-item--last-added')
      .doesNotExist('No column is last added when `lastAddedColumn` is null');

    const dateTimeColumn = addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    this.set('lastAddedColumn', dateTimeColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Date Time (Day)', 'Browser (id)', 'Ad Clicks'],
      'Only the most recently added time dimension column is marked as last added'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, true, false, false],
      'Only the most recently added time dimension column is marked as last added'
    );

    const browserColumn = addItem('dimension', 'browser', 'bardOne');
    this.set('lastAddedColumn', browserColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, true, false],
      'Only the most recently added dimension column is marked as last added'
    );

    const adClicksColumn = addItem('metric', 'adClicks', 'bardOne');
    this.set('lastAddedColumn', adClicksColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, false, true],
      'Only the most recently added metric column is marked as last added'
    );
  });

  test('accordion', async function (assert) {
    const dateTimeColumn = addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    this.set('lastAddedColumn', dateTimeColumn);

    await render(TEMPLATE);

    await animationsSettled();
    assert.dom('.navi-column-config-item--open').exists({ count: 1 }, 'Date time column is initially open');

    const adClicksColumn = addItem('metric', 'adClicks', 'bardOne');
    this.set('lastAddedColumn', adClicksColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, true],
      'Last added column is open'
    );

    const browserColumn = addItem('dimension', 'browser', 'bardOne');
    this.set('lastAddedColumn', browserColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, true, false],
      'Last added column is open'
    );

    await click('.navi-column-config-item[data-name="adClicks"] .navi-column-config-item__trigger');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, true],
      'Clicked metric column is open'
    );

    await click('.navi-column-config-item[data-name="browser(field=id)"] .navi-column-config-item__trigger');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, true, false],
      'Clicked dimension column is open'
    );

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Ad Clicks'],
      'The expected columns are in the column config'
    );
  });

  test('reordering a column', async function (assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    const browserColumn = addItem('dimension', 'browser', 'bardOne');
    addItem('metric', 'adClicks', 'bardOne');

    this.onReorderColumn = (column, index) => {
      assert.deepEqual(column, browserColumn, 'The browser column is moved');
      assert.strictEqual(index, 2, 'The column is moved to the end of the list');
    };
    await render(TEMPLATE);

    const dimensionColumn = '.navi-column-config-item[data-name="browser(field=id)"]';
    await triggerEvent(dimensionColumn, 'mouseenter');
    await drag('mouse', `${dimensionColumn} .navi-column-config-item__handle`, () => {
      return { dy: 200, dx: undefined };
    });
  });

  test('adding a column after reordering', async function (assert) {
    assert.expect(4);

    addItem('metric', 'adClicks', 'bardOne');
    addItem('dimension', 'browser', 'bardOne');
    //manual reorder
    this.report.request.columns.reverseObjects();
    await render(TEMPLATE);
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Ad Clicks', 'Browser (id)'],
      'The expected columns are in the column config'
    );

    addItem('metric', 'navClicks', 'bardOne');
    await render(TEMPLATE);
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Ad Clicks', 'Browser (id)', 'Nav Link Clicks'],
      'Metrics are always added at the end'
    );

    addItem('dimension', 'currency', 'bardOne');
    await render(TEMPLATE);
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Ad Clicks', 'Browser (id)', 'Currency (id)', 'Nav Link Clicks'],
      'Dimensions are added after the last dimension'
    );

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Week' });
    await render(TEMPLATE);
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((el) => el.textContent.trim()),
      ['Date Time (Day)', 'Date Time (Week)', 'Ad Clicks', 'Browser (id)', 'Currency (id)', 'Nav Link Clicks'],
      'Date dimensions are added at the start'
    );
  });
});
