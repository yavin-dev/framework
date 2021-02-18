import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let metadataService, service;

module('Unit | Service | fragmentFactory', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    metadataService = this.owner.lookup('service:navi-metadata');
    service = this.owner.lookup('service:fragment-factory');
    await metadataService.loadMetadata();
  });

  test('Build Column Fragments From Meta', function (assert) {
    const metricMeta = metadataService.getById('metric', 'navClicks', 'bardOne');
    const dimMeta = metadataService.getById('dimension', 'browser', 'bardOne');

    const metricMetaFragment = service.createColumnFromMeta(
      metricMeta,
      { avg: 'trailing31day' },
      'clicksTrailingMonthAvg'
    );
    assert.equal(metricMetaFragment.cid.length, 10, 'Metric has a proper cid');
    assert.equal(metricMetaFragment.field, 'navClicks', 'Metric has right field');
    assert.equal(metricMetaFragment.parameters.avg, 'trailing31day', 'Metric fragment has right parameters');
    assert.equal(metricMetaFragment.alias, 'clicksTrailingMonthAvg', 'Metric Fragment has passed alias');
    assert.equal(metricMetaFragment.type, 'metric', 'Metric Fragment has metric type');
    assert.equal(metricMetaFragment.columnMetadata.category, 'Clicks', 'Metric fragment meta is populated correctly');
    assert.equal(metricMetaFragment.columnMetadata.source, 'bardOne', 'Metric fragment meta data has right datasource');

    const dimensionMetaFragment = service.createColumnFromMeta(dimMeta, {}, 'agent');
    assert.equal(dimensionMetaFragment.cid.length, 10, 'Dimension has a proper cid');
    assert.equal(dimensionMetaFragment.field, 'browser', 'Dimension has right field');
    assert.deepEqual(dimensionMetaFragment.parameters, {}, 'Dimension fragment has right parameters');
    assert.equal(dimensionMetaFragment.alias, 'agent', 'Dimension Fragment has passed alias');
    assert.equal(dimensionMetaFragment.type, 'dimension', 'Dimension Fragment has metric type');
    assert.equal(
      dimensionMetaFragment.columnMetadata.category,
      'test',
      'Dimension fragment meta is populated correctly'
    );
    assert.equal(
      dimensionMetaFragment.columnMetadata.source,
      'bardOne',
      'Dimension fragment meta data has right datasource'
    );
  });

  test('Build Column Fragments Without Meta', function (assert) {
    const metricMetaFragment = service.createColumn(
      'metric',
      'bardOne',
      'revenue',
      { currency: 'USD' },
      'revenueTrailingMonthAvg'
    );
    assert.equal(metricMetaFragment.cid.length, 10, 'Metric has a proper cid');
    assert.equal(metricMetaFragment.field, 'revenue', 'Metric has right field');
    assert.equal(metricMetaFragment.parameters.currency, 'USD', 'Metric fragment has right parameters');
    assert.equal(metricMetaFragment.alias, 'revenueTrailingMonthAvg', 'Metric Fragment has passed alias');
    assert.equal(metricMetaFragment.type, 'metric', 'Metric Fragment has metric type');
    assert.equal(metricMetaFragment.columnMetadata.category, 'Revenue', 'Metric fragment meta is populated correctly');
    assert.equal(metricMetaFragment.columnMetadata.source, 'bardOne', 'Metric fragment meta data has right datasource');

    const dimensionMetaFragment = service.createColumn('dimension', 'bardOne', 'browser', {}, 'agent');
    assert.equal(dimensionMetaFragment.cid.length, 10, 'Dimension has a proper cid');
    assert.equal(dimensionMetaFragment.field, 'browser', 'Dimension has right field');
    assert.deepEqual(dimensionMetaFragment.parameters, {}, 'Dimension fragment has right parameters');
    assert.equal(dimensionMetaFragment.alias, 'agent', 'Dimension Fragment has passed alias');
    assert.equal(dimensionMetaFragment.type, 'dimension', 'Dimension Fragment has metric type');
    assert.equal(
      dimensionMetaFragment.columnMetadata.category,
      'test',
      'Dimension fragment meta is populated correctly'
    );
    assert.equal(
      dimensionMetaFragment.columnMetadata.source,
      'bardOne',
      'Dimension fragment meta data has right datasource'
    );
  });

  test('Build Filter Fragments From Meta', function (assert) {
    const metricMeta = metadataService.getById('metric', 'navClicks', 'bardOne');
    const dimMeta = metadataService.getById('dimension', 'browser', 'bardOne');

    const metricMetaFragment = service.createFilterFromMeta(metricMeta, { avg: 'trailing31day' }, 'in', [1, 2, 3]);
    assert.equal(metricMetaFragment.field, 'navClicks', 'Metric has right field');
    assert.equal(metricMetaFragment.parameters.avg, 'trailing31day', 'Metric fragment has right parameters');
    assert.equal(metricMetaFragment.operator, 'in', 'Metric Fragment has passed operator');
    assert.deepEqual(metricMetaFragment.values, [1, 2, 3], 'Metric Fragment has right values');
    assert.equal(metricMetaFragment.columnMetadata.category, 'Clicks', 'Metric fragment meta is populated correctly');
    assert.equal(metricMetaFragment.columnMetadata.source, 'bardOne', 'Metric fragment meta data has right datasource');

    const dimensionMetaFragment = service.createFilterFromMeta(dimMeta, {}, 'contains', ['chrome', 'firefox']);
    assert.equal(dimensionMetaFragment.field, 'browser', 'Dimension has right field');
    assert.deepEqual(dimensionMetaFragment.parameters, {}, 'Dimension fragment has right parameters');
    assert.equal(dimensionMetaFragment.operator, 'contains', 'Dimension Fragment has passed opeator');
    assert.deepEqual(dimensionMetaFragment.values, ['chrome', 'firefox'], 'Dimension Fragment has metric values');
    assert.equal(
      dimensionMetaFragment.columnMetadata.category,
      'test',
      'Dimension fragment meta is populated correctly'
    );
    assert.equal(
      dimensionMetaFragment.columnMetadata.source,
      'bardOne',
      'Dimension fragment meta data has right datasource'
    );
  });

  test('Build Filter Fragments Without Meta', function (assert) {
    const metricMetaFragment = service.createFilter('metric', 'bardOne', 'navClicks', { avg: 'trailing31day' }, 'in', [
      1,
      2,
      3,
    ]);
    assert.equal(metricMetaFragment.field, 'navClicks', 'Metric has right field');
    assert.equal(metricMetaFragment.parameters.avg, 'trailing31day', 'Metric fragment has right parameters');
    assert.equal(metricMetaFragment.operator, 'in', 'Metric Fragment has passed operator');
    assert.deepEqual(metricMetaFragment.values, [1, 2, 3], 'Metric Fragment has right values');
    assert.equal(metricMetaFragment.columnMetadata.category, 'Clicks', 'Metric fragment meta is populated correctly');
    assert.equal(metricMetaFragment.columnMetadata.source, 'bardOne', 'Metric fragment meta data has right datasource');

    const dimensionMetaFragment = service.createFilter('dimension', 'bardOne', 'browser', {}, 'contains', [
      'chrome',
      'firefox',
    ]);
    assert.equal(dimensionMetaFragment.field, 'browser', 'Dimension has right field');
    assert.deepEqual(dimensionMetaFragment.parameters, {}, 'Dimension fragment has right parameters');
    assert.equal(dimensionMetaFragment.operator, 'contains', 'Dimension Fragment has passed opeator');
    assert.deepEqual(dimensionMetaFragment.values, ['chrome', 'firefox'], 'Dimension Fragment has metric values');
    assert.equal(
      dimensionMetaFragment.columnMetadata.category,
      'test',
      'Dimension fragment meta is populated correctly'
    );
    assert.equal(
      dimensionMetaFragment.columnMetadata.source,
      'bardOne',
      'Dimension fragment meta data has right datasource'
    );
  });

  test('Build Sort Fragments From Meta', function (assert) {
    const metricMeta = metadataService.getById('metric', 'navClicks', 'bardOne');

    const metricMetaFragment = service.createSortFromMeta(metricMeta, { avg: 'trailing31day' }, 'asc');
    assert.equal(metricMetaFragment.field, 'navClicks', 'Sort Fragment has right field');
    assert.equal(metricMetaFragment.parameters.avg, 'trailing31day', 'Sort fragment has right parameters');
    assert.equal(metricMetaFragment.direction, 'asc', 'Sort Fragment has passed operator');
    assert.equal(metricMetaFragment.columnMetadata.category, 'Clicks', 'Sort fragment meta is populated correctly');
    assert.equal(metricMetaFragment.columnMetadata.source, 'bardOne', 'Sort fragment meta data has right datasource');
  });

  test('Build Sort Fragments Without Meta', function (assert) {
    const metricMetaFragment = service.createSort('metric', 'bardOne', 'revenue', { currency: 'USD' }, 'desc');
    assert.equal(metricMetaFragment.field, 'revenue', 'Sort Fragment has right field');
    assert.equal(metricMetaFragment.parameters.currency, 'USD', 'Sort fragment has right parameters');
    assert.equal(metricMetaFragment.direction, 'desc', 'Sort Fragment has passed operator');
    assert.equal(metricMetaFragment.columnMetadata.category, 'Revenue', 'Sort fragment meta is populated correctly');
    assert.equal(metricMetaFragment.columnMetadata.source, 'bardOne', 'Sort fragment meta data has right datasource');
  });
});
