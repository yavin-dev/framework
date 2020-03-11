import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
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
    this.owner.register('helper:update-report-action', buildHelper(() => {}), { instantiate: false });
    Metadata = this.owner.lookup('service:bard-metadata');
    Store = this.owner.lookup('service:store');

    await Metadata.loadMetadata();
    this.set(
      'report',
      Store.createRecord('report', {
        request: Store.createFragment('bard-request/request', {
          logicalTable: Store.createFragment('bard-request/fragments/logicalTable', {
            table: Metadata.getById('table', 'tableA'),
            timeGrainName: 'day'
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
    assert.expect(3);

    await render(hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} />`);

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)'],
      'The date time column is initially added and set to day'
    );

    this.set('report.request.logicalTable.timeGrainName', 'week');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Week)'],
      'The date time column is changed to week'
    );

    this.set('report.request.logicalTable.timeGrainName', 'all');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      [],
      'The date time column is removed when timegrain is set to all'
    );
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
    assert.expect(4);

    this.onRemoveDateTime = () => assert.ok(true, 'onRemoveDateTime was called');
    await render(
      hbs`<NaviColumnConfig @report={{this.report}} @isOpen={{true}} @onRemoveDateTime={{this.onRemoveDateTime}} />`
    );

    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(el => el.textContent.trim()),
      ['Date Time (Day)'],
      'Initial columns are added'
    );

    await click('.navi-column-config-item__name[title="Date Time (Day)"]'); // open date time config
    assert.dom('.navi-column-config-base__clone-icon').doesNotExist('Date time config has no clone icon');
    assert.dom('.navi-column-config-base__filter-icon').doesNotExist('Date time config has no filter icon');
    await click('.navi-column-config-item__remove-icon');
  });

  test('Header config buttons - metric', async function(assert) {
    assert.expect(8);

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
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Metric config has filter icon');
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
  });

  test('Header config buttons - parameterized metric', async function(assert) {
    assert.expect(8);

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
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Metric config has filter icon');
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
  });

  test('Header config buttons - dimension', async function(assert) {
    assert.expect(8);

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
    await click('.navi-column-config-base__clone-icon');
    assert.dom('.navi-column-config-base__filter-icon').exists({ count: 1 }, 'Dimension config has filter icon');
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
  });
});
