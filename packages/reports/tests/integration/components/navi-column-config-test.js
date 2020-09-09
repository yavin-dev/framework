import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { getContext } from '@ember/test-helpers';

let Store, Metadata;

function addItem(type, item, dataSource, parameters = {}) {
  const self = getContext();
  const metadata = self.owner.lookup('service:navi-metadata').getById(type, item, dataSource);
  return self.report.request.addColumnFromMetaWithParams(metadata, parameters);
}

const TEMPLATE = hbs`
<NaviColumnConfig
  @isOpen={{true}}
  @lastAddedColumn={{this.lastAddedColumn}}
  @report={{this.report}}
  @onAddColumn={{optional this.onAddColumn}}
  @onRemoveColumn={{optional this.onRemoveColumn}}
  @onToggleFilter={{optional this.onToggleFilter}}
  @openFilters={{optional this.openFilters}}
  @onRenameColumn={{optional this.onRenameColumn}}
  @onReorderColumn={{optional this.onReorderColumn}}
  @onUpdateColumnParam={{optional this.onUpdateColumnParam}}
/>`;

module('Integration | Component | navi-column-config', function(hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Metadata = this.owner.lookup('service:navi-metadata');
    Store = this.owner.lookup('service:store');

    await Metadata.loadMetadata({ dataSourceName: 'bardOne' });
    this.set(
      'report',
      Store.createRecord('report', {
        request: Store.createFragment('bard-request-v2/request', {
          table: 'tableA',
          dataSource: 'bardOne',
          columns: [],
          sorts: [],
          filters: []
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
                    metrics: [{ metric: 'adClicks', parameters: {}, canonicalName: 'adClicks' }]
                  }
                }
              }
            }
          }
        }
      })
    );
  });

  test('it renders', async function(assert) {
    await render(hbs`<NaviColumnConfig @report={{this.report}} />`);
    await animationsSettled();
    assert.dom('.navi-column-config').exists('NaviColumnConfig renders');
  });

  test('it opens and closes', async function(assert) {
    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{this.isOpen}} />`);

    await animationsSettled();
    assert.dom('.navi-column-config__panel').doesNotExist('Drawer is closed when `isOpen` is false');

    this.set('isOpen', true);
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Drawer is open when `isOpen` is true');

    this.set('isOpen', false);
    await animationsSettled();
    assert.dom('.navi-column-config__panel').doesNotExist('Drawer is closed when `isOpen` is false');
  });

  test('it fires drawerDidChange action', async function(assert) {
    assert.expect(3);

    this.set('drawerDidChange', () => assert.ok('drawerDidChange fires'));

    await render(hbs`<NaviColumnConfig
      @report={{this.report}}
      @isOpen={{this.isOpen}}
      @drawerDidChange={{this.drawerDidChange}}
    />`);
    await animationsSettled();

    this.set('isOpen', true);
    await animationsSettled();

    this.set('isOpen', false);
    await animationsSettled();

    this.set('isOpen', true);
    await animationsSettled();
  });

  test('time grain - switching and removing', async function(assert) {
    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'day' });
    await render(TEMPLATE);
    await animationsSettled();

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (day)'],
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

    await click('.navi-column-config-item__name[title="Date Time (day)"]');
    await clickTrigger('.navi-column-config-item__parameter'); // open the time grain dropdown
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-dropdown .ember-power-select-option').map(el =>
        el.textContent.trim()
      ),
      ['Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year', 'All'],
      'The table time grains are passed correctly to the time grain column'
    );

    this.set('report.request.columns.firstObject.parameters', { grain: 'week' });
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (week)'],
      'The date time column is changed to week'
    );
  });

  test('metrics - adding', async function(assert) {
    assert.expect(2);

    await render(TEMPLATE);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('metric', 'adClicks', 'bardOne');
    addItem('metric', 'navClicks', 'bardOne');
    await animationsSettled();

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'Metrics are displayed after the date time column'
    );

    addItem('metric', 'adClicks', 'bardOne');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );
  });

  test('metrics - removing from start', async function(assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('metric', 'adClicks', 'bardOne');
    addItem('metric', 'navClicks', 'bardOne');
    addItem('metric', 'adClicks', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'All metrics are initially rendered'
    );

    this.report.request.columns.removeObject(this.report.request.metricColumns.firstObject);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Nav Link Clicks', 'Ad Clicks'],
      'A metric can be removed from the start'
    );
  });

  test('metrics - removing from end', async function(assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('metric', 'adClicks', 'bardOne');
    addItem('metric', 'navClicks', 'bardOne');
    addItem('metric', 'adClicks', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'All metrics are initially rendered'
    );

    this.report.request.columns.removeObject(this.report.request.metricColumns.lastObject);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'A metric can be removed from the end'
    );
  });

  test('dimensions - adding', async function(assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('dimension', 'browser', 'bardOne');
    addItem('dimension', 'currency', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)'],
      'Dimensions are displayed after the date time column'
    );

    addItem('dimension', 'browser', 'bardOne');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)', 'Browser (id)'],
      'Duplicate dimensions can be added'
    );
  });

  test('dimensions - removing from start', async function(assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('dimension', 'browser', 'bardOne');
    addItem('dimension', 'currency', 'bardOne');
    addItem('dimension', 'browser', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)', 'Browser (id)'],
      'All dimensions are initially rendered'
    );

    this.report.request.columns.removeObject(this.report.request.dimensionColumns.firstObject);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Browser (id)', 'Currency (id)', 'Browser (id)'],
      'A dimension can be removed from the start'
    );
  });

  test('dimensions - removing from end', async function(assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    addItem('dimension', 'browser', 'bardOne');
    addItem('dimension', 'currency', 'bardOne');
    addItem('dimension', 'browser', 'bardOne');
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)', 'Browser (id)'],
      'All dimensions are initially rendered'
    );

    this.report.request.columns.removeObject(this.report.request.dimensionColumns.lastObject);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Currency (id)'],
      'A dimension can be removed from the start'
    );
  });

  test('metrics and dimensions - adding', async function(assert) {
    assert.expect(2);

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    await render(TEMPLATE);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
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
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Nav Link Clicks', 'Currency (id)', 'Ad Clicks', 'Product Family (id)'],
      'columns are displayed in the order they are added'
    );
  });

  test('Header config buttons - date dimension', async function(assert) {
    assert.expect(6);

    this.onAddColumn = () => assert.ok(true, 'onAddColumn was called for time dimension column');
    this.onRemoveColumn = () => assert.ok(true, 'onRemoveColumn was called for time dimension column');
    this.onToggleFilter = () => assert.ok(true, 'onToggleFilter was called for time dimension column');

    addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'day' });
    await render(TEMPLATE);
    await animationsSettled();
    await click('.navi-column-config-item__name[title="Date Time (day)"]');
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (day)'],
      'Initial columns are added'
    );

    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Time dimension config has clone icon');
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Time dimension config has filter icon');
    await click('.navi-column-config-base__filter-icon');
    await click('.navi-column-config-item__remove-icon');
    await animationsSettled();
  });

  test('Header config buttons - metric', async function(assert) {
    assert.expect(8);

    this.onAddColumn = () => assert.ok(true, 'Clone was called');
    this.onToggleFilter = () => assert.ok(true, 'Filter was called');
    this.onRemoveColumn = () => assert.ok(true, 'onRemoveColumn was called');
    addItem('metric', 'navClicks', 'bardOne');
    await render(TEMPLATE);

    await click('.navi-column-config-item__name[title="Nav Link Clicks"]');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Nav Link Clicks'],
      'Initial columns are added'
    );

    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Metric config has clone icon');

    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Metric config has filter icon');
    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass('navi-column-config-base__filter-icon--active', 'Metric config filter is not active');

    const { request } = this.report;
    request.addFilter({ ...request.columns.objectAt(0).serialize(), operator: 'in', values: [] });
    await settled();
    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'Metric config filter is active if there is a having');

    await click(findAll('.navi-column-config-item__remove-icon')[0]);
    await animationsSettled();
  });

  test('Header config buttons - dimension', async function(assert) {
    assert.expect(8);

    this.onAddColumn = () => assert.ok(true, 'Clone was called');
    this.onToggleFilter = () => assert.ok(true, 'Filter was called');
    this.onRemoveColumn = () => assert.ok(true, 'onRemoveColumn was called');
    addItem('dimension', 'browser', 'bardOne');

    await render(TEMPLATE);

    await animationsSettled();
    await click('.navi-column-config-item__name[title="Browser (id)"]');
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Browser (id)'],
      'Initial columns are added'
    );

    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Dimension config has clone icon');
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Dimension config has filter icon');
    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass('navi-column-config-base__filter-icon--active', 'Dimension config filter is not active');

    const { request } = this.report;
    request.addFilter({ ...request.columns.objectAt(0).serialize(), operator: 'in', values: [] });
    await settled();

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass(
        'navi-column-config-base__filter-icon--active',
        'Dimension config filter is active if there is a filter'
      );

    await click(findAll('.navi-column-config-item__remove-icon')[0]);
    await animationsSettled();
  });

  test('last added column', async function(assert) {
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
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser (id)', 'Ad Clicks', 'Date Time (Day)'],
      'Only the most recently added time dimension column is marked as last added'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, true],
      'Only the most recently added time dimension column is marked as last added'
    );

    const browserColumn = addItem('dimension', 'browser', 'bardOne');
    this.set('lastAddedColumn', browserColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, true],
      'Only the most recently added dimension column is marked as last added'
    );

    const adClicksColumn = addItem('metric', 'adClicks', 'bardOne');
    this.set('lastAddedColumn', adClicksColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, false, true],
      'Only the most recently added metric column is marked as last added'
    );
  });

  test('accordion', async function(assert) {
    const dateTimeColumn = addItem('timeDimension', 'tableA.dateTime', 'bardOne', { grain: 'Day' });
    this.set('lastAddedColumn', dateTimeColumn);

    await render(TEMPLATE);

    await animationsSettled();
    assert.dom('.navi-column-config-item--open').exists({ count: 1 }, 'Date time column is initially open');

    const adClicksColumn = addItem('metric', 'adClicks', 'bardOne');
    this.set('lastAddedColumn', adClicksColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, true],
      'Last added column is open'
    );

    const browserColumn = addItem('dimension', 'browser', 'bardOne');
    this.set('lastAddedColumn', browserColumn);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, true],
      'Last added column is open'
    );

    await click('.navi-column-config-item[data-name="adClicks"] .navi-column-config-item__trigger');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, true, false],
      'Clicked metric column is open'
    );

    await click('.navi-column-config-item[data-name="browser(field=id)"] .navi-column-config-item__trigger');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, true],
      'Clicked dimension column is open'
    );

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Browser (id)'],
      'The expected columns are in the column config'
    );
  });
});
