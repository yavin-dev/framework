import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { animationsSettled } from 'ember-animated/test-support';
import { A } from '@ember/array';
import { getContext } from '@ember/test-helpers';

let Store, Metadata;

function addItem(type, metric) {
  const self = getContext();
  self.report.request[`${type}s`].pushObject(
    Store.createFragment(`bard-request/fragments/${type}`, {
      [type]: self.owner.lookup('service:bard-metadata').getById(type, metric)
    })
  );
}

module('Integration | Component | navi-column-config', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
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
          dimensions: A([])
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
});
