import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { A } from '@ember/array';
import { getContext } from '@ember/test-helpers';
import { helper as buildHelper } from '@ember/component/helper';

let Store, Metadata;

function addItem(type, item) {
  const self = getContext();
  self.report.request[`${type}s`].pushObject(
    Store.createFragment(`bard-request/fragments/${type}`, {
      [type]: self.owner.lookup('service:bard-metadata').getById(type, item)
    })
  );
}

module('Integration | Component | navi-column-config', function(hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.owner.register(
      'helper:update-report-action',
      buildHelper(() => {}),
      { instantiate: false }
    );
    Metadata = this.owner.lookup('service:bard-metadata');
    Store = this.owner.lookup('service:store');

    await Metadata.loadMetadata();
    this.set(
      'report',
      Store.createRecord('report', {
        request: Store.createFragment('bard-request/request', {
          logicalTable: Store.createFragment('bard-request/fragments/logicalTable', {
            table: Metadata.getById('table', 'tableA'),
            timeGrain: 'day'
          }),
          metrics: A([]),
          dimensions: A([]),
          filters: A([]),
          having: A([])
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
    assert.expect(8);

    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)'],
      'The date time column is initially added and set to day'
    );

    assert
      .dom('.navi-column-config-item__remove-icon')
      .doesNotHaveClass(
        'navi-column-config-item__remove-icon--disabled',
        'remove button of date time column does not have disabled class'
      );
    assert
      .dom('.navi-column-config-item__remove-icon')
      .isNotDisabled('remove button of date time column is not disabled');

    await click('.navi-column-config-item__name[title="Date Time (Day)"]'); // open date time config
    await clickTrigger('.navi-column-config-item__parameter'); // open the time grain dropdown
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-dropdown .ember-power-select-option').map(el =>
        el.textContent.trim()
      ),
      ['Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year'],
      'The table time grains are passed correctly to the time grain column'
    );

    this.set('report.request.logicalTable.timeGrain', 'week');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Week)'],
      'The date time column is changed to week'
    );

    this.set('report.request.logicalTable.timeGrain', 'all');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      [],
      'The date time column is removed when timegrain is set to all'
    );

    this.set('report.request.logicalTable.table', { timeGrainIds: ['day'], timeGrains: [{ id: 'day', name: 'Day' }] });
    this.set('report.request.logicalTable.timeGrain', 'day');
    await animationsSettled();
    assert
      .dom('.navi-column-config-item__remove-icon')
      .hasClass(
        'navi-column-config-item__remove-icon--disabled',
        'remove button of date time column has disabled class'
      );
    assert.dom('.navi-column-config-item__remove-icon').isDisabled('remove button of date time column is disabled');
  });

  test('metrics - adding', async function(assert) {
    assert.expect(2);

    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    addItem('metric', 'adClicks');
    addItem('metric', 'navClicks');
    await animationsSettled();

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'Metrics are displayed after the date time column'
    );

    addItem('metric', 'adClicks');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );
  });

  test('metrics - removing from start', async function(assert) {
    assert.expect(2);

    addItem('metric', 'adClicks');
    addItem('metric', 'navClicks');
    addItem('metric', 'adClicks');
    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'All metrics are initially rendered'
    );

    this.report.request.metrics.removeObject(this.report.request.metrics.firstObject);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Nav Link Clicks', 'Ad Clicks'],
      'A metric can be removed from the start'
    );
  });

  test('metrics - removing from end', async function(assert) {
    assert.expect(2);

    addItem('metric', 'adClicks');
    addItem('metric', 'navClicks');
    addItem('metric', 'adClicks');
    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'All metrics are initially rendered'
    );

    this.report.request.metrics.removeObject(this.report.request.metrics.lastObject);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'A metric can be removed from the end'
    );
  });

  test('dimensions - adding', async function(assert) {
    assert.expect(2);

    addItem('dimension', 'browser');
    addItem('dimension', 'currency');
    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser', 'Currency'],
      'Dimensions are displayed after the date time column'
    );

    addItem('dimension', 'browser');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser', 'Currency', 'Browser'],
      'Duplicate dimensions can be added'
    );
  });

  test('dimensions - removing from start', async function(assert) {
    assert.expect(2);

    addItem('dimension', 'browser');
    addItem('dimension', 'currency');
    addItem('dimension', 'browser');
    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser', 'Currency', 'Browser'],
      'All dimensions are initially rendered'
    );

    this.report.request.dimensions.removeObject(this.report.request.dimensions.firstObject);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Currency', 'Browser'],
      'A dimension can be removed from the start'
    );
  });

  test('dimensions - removing from end', async function(assert) {
    assert.expect(2);

    addItem('dimension', 'browser');
    addItem('dimension', 'currency');
    addItem('dimension', 'browser');
    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser', 'Currency', 'Browser'],
      'All dimensions are initially rendered'
    );

    this.report.request.dimensions.removeObject(this.report.request.dimensions.lastObject);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser', 'Currency'],
      'A dimension can be removed from the start'
    );
  });

  test('metrics and dimensions - adding', async function(assert) {
    assert.expect(2);

    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)'],
      'The columns are all initially rendered'
    );

    addItem('dimension', 'browser');
    addItem('metric', 'navClicks');
    addItem('dimension', 'currency');
    addItem('metric', 'adClicks');
    addItem('dimension', 'productFamily');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser', 'Currency', 'Product Family', 'Nav Link Clicks', 'Ad Clicks'],
      'date time, then dimensions, then metrics are displayed' // TODO: This will change
    );
  });

  test('Header config buttons - date time', async function(assert) {
    assert.expect(8);

    this.onAddDimension = () => assert.ok(false, 'Clone was called for dateTime column');
    this.onAddMetric = () => assert.ok(false, 'Clone was called for dateTime column');
    this.onAddMetricWithParameter = () => assert.ok(false, 'Clone was called for dateTime column');
    this.onToggleDimFilter = () => assert.ok(false, 'Filter toggle was called for dateTime column');
    this.onToggleMetricFilter = () => assert.ok(false, 'Filter toggle was called for dateTime column');
    this.onToggleParameterizedMetricFilter = () => assert.ok(false, 'Filter toggle was called for dateTime column');
    this.onRemoveTimeDimension = () => assert.ok(true, 'onRemoveTimeDimension was called');
    await render(
      hbs`<NaviColumnConfig
        @report={{this.report}}
        @isOpen={{true}}
        @onAddDimension={{this.onAddDimension}}
        @onAddMetric={{this.onAddMetric}}
        @onAddMetricWithParameter={{this.onAddMetricWithParameter}}
        @onToggleDimFilter={{this.onToggleDimFilter}}
        @onToggleMetricFilter={{this.onToggleMetricFilter}}
        @onToggleParameterizedMetricFilter={{this.onToggleParameterizedMetricFilter}}
        @onRemoveTimeDimension={{this.onRemoveTimeDimension}} />`
    );

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)'],
      'Initial columns are added'
    );

    await click('.navi-column-config-item__name[title="Date Time (Day)"]'); // open date time config
    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Date time config has clone icon');
    assert
      .dom('.navi-column-config-base__clone-icon')
      .hasClass('navi-column-config-base__clone-icon--disabled', 'Date time config clone icon has a `disabled` class');
    assert
      .dom('.navi-column-config-base__clone-icon')
      .hasAttribute('aria-disabled', 'true', 'Date time config clone icon has aria-disabled="true" attribute');
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Date time config has filter icon');
    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--disabled', 'Date time config filter has a `disabled` class');
    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasAttribute('aria-disabled', 'true', 'Date time config filter icon has aria-disabled="true" attribute');
    await click('.navi-column-config-base__filter-icon');
    await click('.navi-column-config-item__remove-icon');
    await animationsSettled();
  });

  test('Header config buttons - metric', async function(assert) {
    assert.expect(12);

    this.onAddMetric = () => assert.ok(true, 'Clone was called');
    this.onToggleMetricFilter = () => assert.ok(true, 'Filter was called');
    this.onRemoveMetric = () => assert.ok(true, 'onRemoveMetric was called');
    await render(
      hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} @onAddMetric={{this.onAddMetric}} @onToggleMetricFilter={{this.onToggleMetricFilter}} @onRemoveMetric={{this.onRemoveMetric}} />`
    );

    addItem('metric', 'navClicks');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Nav Link Clicks'],
      'Initial columns are added'
    );

    await click('.navi-column-config-item__name[title="Nav Link Clicks"]'); // open metric config
    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Metric config has clone icon');
    assert
      .dom('.navi-column-config-base__clone-icon')
      .doesNotHaveClass(
        'navi-column-config-base__clone-icon--disabled',
        'Metric config clone icon does not have a `disabled` class'
      );
    assert
      .dom('.navi-column-config-base__clone-icon')
      .hasAttribute('aria-disabled', 'false', 'Metric config clone icon has aria-disabled="false" attribute');
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Metric config has filter icon');
    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--disabled',
        'Metric config filter icon does not have a `disabled` class'
      );
    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasAttribute('aria-disabled', 'false', 'Metric config filter icon has aria-disabled="false" attribute');
    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass('navi-column-config-base__filter-icon--active', 'Metric config filter is not active');

    this.report.request.having.pushObject({ metric: this.report.request.metrics.objectAt(0) });
    await settled();

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'Metric config filter is active if there is a having');

    await click(findAll('.navi-column-config-item__remove-icon')[1]);
    await animationsSettled();
  });

  test('Header config buttons - parameterized metric', async function(assert) {
    assert.expect(12);

    this.onAddMetricWithParameter = () => assert.ok(true, 'onAddMetricWithParameter was called');
    this.onToggleParameterizedMetricFilter = () => assert.ok(true, 'onToggleParameterizedMetricFilter was called');
    this.onRemoveMetric = () => assert.ok(true, 'onRemoveMetric was called');
    await render(
      hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} @onAddMetricWithParameter={{this.onAddMetricWithParameter}} @onToggleParameterizedMetricFilter={{this.onToggleParameterizedMetricFilter}} @onRemoveMetric={{this.onRemoveMetric}} />`
    );

    addItem('metric', 'platformRevenue');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Platform Revenue'],
      'Initial columns are added'
    );

    await click('.navi-column-config-item__name[title="Platform Revenue"]'); // open parameterized metric config
    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Metric config has clone icon');
    assert
      .dom('.navi-column-config-base__clone-icon')
      .doesNotHaveClass(
        'navi-column-config-base__clone-icon--disabled',
        'Metric config clone icon does not have a `disabled` class'
      );
    assert
      .dom('.navi-column-config-base__clone-icon')
      .hasAttribute('aria-disabled', 'false', 'Metric config clone icon has aria-disabled="false" attribute');
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Metric config has filter icon');
    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--disabled',
        'Metric config filter icon does not have a `disabled` class'
      );
    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasAttribute('aria-disabled', 'false', 'Metric config filter icon has aria-disabled="false" attribute');
    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass('navi-column-config-base__filter-icon--active', 'Metric config filter is not active');

    this.report.request.having.pushObject({ metric: this.report.request.metrics.objectAt(0) });
    await settled();

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'Metric config filter is active if there is a having');

    await click(findAll('.navi-column-config-item__remove-icon')[1]);
    await animationsSettled();
  });

  test('Header config buttons - dimension', async function(assert) {
    assert.expect(12);

    this.onAddDimension = () => assert.ok(true, 'Clone was called');
    this.onToggleDimFilter = () => assert.ok(true, 'Filter was called');
    this.onRemoveDimension = () => assert.ok(true, 'onRemoveDimension was called');
    await render(
      hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} @onAddDimension={{this.onAddDimension}} @onToggleDimFilter={{this.onToggleDimFilter}} @onRemoveDimension={{this.onRemoveDimension}} />`
    );

    addItem('dimension', 'browser');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Browser'],
      'Initial columns are added'
    );

    await click('.navi-column-config-item__name[title="Browser"]'); // open dimension config
    assert.dom('.navi-column-config-base__clone-icon').exists({ count: 1 }, 'Dimension config has clone icon');
    assert
      .dom('.navi-column-config-base__clone-icon')
      .doesNotHaveClass(
        'navi-column-config-base__clone-icon--disabled',
        'Dimension config clone icon does not have a `disabled` class'
      );
    assert
      .dom('.navi-column-config-base__clone-icon')
      .hasAttribute('aria-disabled', 'false', 'Dimension config clone icon has aria-disabled="false" attribute');
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Dimension config has filter icon');
    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--disabled',
        'Dimension config filter icon does not have a `disabled` class'
      );
    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasAttribute('aria-disabled', 'false', 'Dimension config filter icon has aria-disabled="false" attribute');
    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass('navi-column-config-base__filter-icon--active', 'Dimension config filter is not active');

    this.report.request.filters.pushObject({ dimension: this.report.request.dimensions.objectAt(0).dimension });
    await settled();

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass(
        'navi-column-config-base__filter-icon--active',
        'Dimension config filter is active if there is a filter'
      );

    await click(findAll('.navi-column-config-item__remove-icon')[1]);
    await animationsSettled();
  });

  test('last added column', async function(assert) {
    assert.expect(6);

    this.set('lastAddedColumn', { type: 'dimension', name: 'foo' });
    addItem('dimension', 'browser');
    await render(
      hbs`<NaviColumnConfig @report={{this.report}} @lastAddedColumn={{this.lastAddedColumn}} @isOpen={{true}} />`
    );

    await animationsSettled();
    let elements = findAll('.navi-column-config-item');
    assert.deepEqual(
      elements.map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false],
      'No column has the `last-added` class'
    );
    assert.deepEqual(
      elements.map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false],
      'No column is open'
    );

    this.set('lastAddedColumn', { type: 'dimension', name: 'browser' });
    await render(
      hbs`<NaviColumnConfig @report={{this.report}} @lastAddedColumn={{this.lastAddedColumn}} @isOpen={{true}} />`
    );

    await animationsSettled();
    elements = findAll('.navi-column-config-item');
    assert.deepEqual(
      elements.map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, true],
      'Last added column has the correct class'
    );
    assert.deepEqual(
      elements.map(el => el.classList.contains('navi-column-config-item--open')),
      [false, true],
      'Last added column is open'
    );

    addItem('dimension', 'browser');
    await animationsSettled();
    elements = findAll('.navi-column-config-item');
    assert.deepEqual(
      elements.map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, true],
      'Only the most recently added column has the correct class'
    );
    assert.deepEqual(
      elements.map(el => el.classList.contains('navi-column-config-item--open')),
      [false, true, true],
      'Previously added column is still open as well as the most recently added one'
    );
  });
});
