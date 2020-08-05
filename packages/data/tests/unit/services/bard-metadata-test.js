import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';
import metadataRoutes, {
  TableOne,
  TableTwo,
  Tables,
  IDOnlyDim,
  DimensionOne,
  DimensionTwo,
  DimensionThree,
  MetricOne,
  MetricTwo,
  MetricFive,
  MetricSix,
  ColumnFunctionAggTrend,
  ColumnFunctionMoneyMetric,
  Host
} from '../../helpers/metadata-routes';

let Service, Server, originalService;

module('Unit - Service - Bard Metadata', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    originalService = this.owner.factoryFor('service:bard-metadata');
    const newService = this.owner.factoryFor('service:bard-metadata').class.extend({
      host: Host
    });
    this.owner.unregister('service:bard-metadata');
    this.owner.register('service:bard-metadata', newService);

    Service = this.owner.lookup('service:bard-metadata');

    //setup Pretender
    Server = new Pretender(metadataRoutes);
  });

  hooks.afterEach(function() {
    this.owner.unregister('service:bard-metadata');
    this.owner.register('service:bard-metadata', originalService);

    //shutdown pretender
    Server.shutdown();
  });

  test('Service Exists', function(assert) {
    assert.ok(!!Service, 'Service exists');
  });

  test('loadMetadata', async function(assert) {
    assert.expect(4);

    await Service.loadMetadata();
    let keg = Service._keg;

    assert.deepEqual(
      keg.all('metadata/table').mapBy('id'),
      Tables.map(table => table.name),
      'All tables are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/dimension').mapBy('id'),
      [DimensionOne.name, DimensionThree.name, DimensionTwo.name, IDOnlyDim.name],
      'All dimensions are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/metric').mapBy('id'),
      [MetricOne.name, MetricTwo.name, MetricFive.name],
      'All metrics are loaded in the keg'
    );

    assert.deepEqual(Service.loadedDataSources, ['bardOne'], 'One datasource should be loaded');
  });

  test('loadMetadata with metric function ids provided', async function(assert) {
    const dataSource = 'bardOne';
    const keg = Service._keg;
    await Service.loadMetadata();
    assert.deepEqual(
      keg.all('metadata/column-function', dataSource).mapBy('id'),
      [ColumnFunctionMoneyMetric.id, ColumnFunctionAggTrend.id],
      'When at least one metric has a metricFunctionId provided, all metric functions from the metric function endpoint are loaded into the keg'
    );
  });

  test('loadMetadata from multiple sources', async function(assert) {
    assert.expect(12);
    metadataRoutes.bind(Server)(1);
    await Service.loadMetadata({ dataSourceName: 'bardOne' });
    await Service.loadMetadata({ dataSourceName: 'bardTwo' });

    assert.equal(
      Service.getById('table', 'table1', 'bardOne').source,
      'bardOne',
      'Table 1 is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('table', 'table2').source,
      'bardOne',
      'Table 2 is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('table', 'table3', 'bardTwo').source,
      'bardTwo',
      'Table 3 is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('table', 'table4', 'bardTwo').source,
      'bardTwo',
      'Table 4 is loaded with the correct data source'
    );

    assert.equal(
      Service.getById('metric', 'metricOne', 'bardOne').source,
      'bardOne',
      'MetricOne is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('metric', 'metricTwo').source,
      'bardOne',
      'MetricTwo is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('metric', 'metricThree', 'bardTwo').source,
      'bardTwo',
      'MetricThree is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('metric', 'metricFour', 'bardTwo').source,
      'bardTwo',
      'MetricFour is loaded with the correct data source'
    );

    assert.equal(
      Service.getById('dimension', 'dimensionOne', 'bardOne').source,
      'bardOne',
      'DimensionOne is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('dimension', 'dimensionTwo').source,
      'bardOne',
      'DimensionTwo is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('dimension', 'dimensionThree').source,
      'bardOne',
      'DimensionThree is loaded with the correct data source'
    );
    assert.equal(
      Service.getById('dimension', 'dimensionFour', 'bardTwo').source,
      'bardTwo',
      'DimensionFour is loaded with the correct data source'
    );
  });

  test('loadMetadata after data loaded', async function(assert) {
    assert.expect(1);

    const result = await Service.loadMetadata();
    assert.notOk(result, 'loadMetadata returns a promise that resolves to nothing when metadata is already loaded');
  });

  test('_loadMetadataForType', async function(assert) {
    assert.expect(1);

    this.owner.register('model:metadata/record', EmberObject.extend());

    let keg = this.owner.lookup('service:keg'),
      testRecord = { id: 'foo', description: 'foo' };

    await Service._loadMetadataForType('record', [testRecord]);

    let record = keg.getById('metadata/record', 'foo');

    assert.deepEqual(
      { id: record.id, description: record.description },
      testRecord,
      'The testRecord has been pushed to the keg'
    );
  });

  test('all method', async function(assert) {
    assert.expect(5);

    await Service.loadMetadata();
    assert.deepEqual(
      Service.all('table').mapBy('id'),
      [TableOne.name, TableTwo.name, 'smallTable'],
      'all method returns all loaded tables'
    );

    assert.deepEqual(
      Service.all('dimension').mapBy('id'),
      ['dimensionOne', 'dimensionThree', 'dimensionTwo', 'idOnlyDim'],
      'all method returns all loaded dimensions'
    );

    assert.deepEqual(
      Service.all('metric').mapBy('id'),
      ['metricOne', 'metricTwo', 'metricFive'],
      'all method returns all loaded metrics'
    );

    assert.throws(
      () => {
        Service.all('foo');
      },
      new Error('Assertion Failed: Type must be a valid navi-data model type'),
      'Service `all` method throws error when metadata type is invalid'
    );

    Service.set('loadedDataSources', []);

    assert.throws(
      () => {
        Service.all('metric');
      },
      new Error('Assertion Failed: Metadata must be loaded before the operation can be performed'),
      'Service `all` method throws error when metadata is not loaded'
    );
  });

  test('getById', async function(assert) {
    assert.expect(6);

    await Service.loadMetadata();
    let keg = getOwner(Service).lookup('service:keg');

    assert.equal(
      Service.getById('table', 'table1'),
      keg.getById('metadata/table', 'table1', 'bardOne'),
      'Table1 is fetched from the keg using getMetadtaById'
    );

    assert.equal(
      Service.getById('dimension', 'dimensionOne'),
      keg.getById('metadata/dimension', 'dimensionOne', 'bardOne'),
      'DimensionOne is fetched from the keg using getMetadtaById'
    );

    assert.equal(
      Service.getById('metric', 'metricOne'),
      keg.getById('metadata/metric', 'metricOne', 'bardOne'),
      'MetricOne is fetched from the keg using getMetadtaById'
    );

    assert.equal(Service.getById('metric'), undefined, 'getById returns undefined when no id is passed');

    assert.throws(
      () => {
        Service.getById('foo');
      },
      new Error('Assertion Failed: Type must be a valid navi-data model type'),
      'Service `getById` method throws error when metadata type is invalid'
    );

    Service.set('loadedDataSources', []);

    assert.throws(
      () => {
        Service.getById('metric');
      },
      new Error('Assertion Failed: Metadata must be loaded before the operation can be performed'),
      'Service `getById` method throws error when metadata is not loaded'
    );
  });

  test('fetchById', async function(assert) {
    assert.expect(5);
    Service.set('loadedDataSources', ['bardOne']);
    metadataRoutes.bind(Server)(1);

    const expectedMetric = {
      id: MetricOne.name,
      name: MetricOne.longName,
      description: MetricOne.description
    };
    const data = await Service.fetchById('metric', 'metricOne');
    assert.ok(
      Object.keys(expectedMetric).every(key => expectedMetric[key] === data[key]),
      'Service fetchById should load correct data'
    );

    let keg = Service._keg;

    assert.deepEqual(keg.all('metadata/metric').mapBy('id'), ['metricOne'], 'Fetched entity has been added to the keg');

    await Service.fetchById('metric', 'metricOne');
    assert.equal(Server.handledRequests.length, 2, 'Fetched entity from service every call');

    assert.deepEqual(
      keg.all('metadata/metric').mapBy('id'),
      ['metricOne'],
      'Fetching an entity already present in the keg doesn`t add another copy into the keg'
    );

    await Service.fetchById('metric', 'metricThree', 'bardTwo');
    assert.deepEqual(keg.all('metadata/metric').mapBy('id'), ['metricOne', 'metricThree']);

    Service.set('loadedDataSources', []);
  });

  test('multi-source all', async function(assert) {
    metadataRoutes.bind(Server)(1);
    await Service.loadMetadata({ dataSourceName: 'bardOne' });
    await Service.loadMetadata({ dataSourceName: 'bardTwo' });

    assert.deepEqual(
      Service.all('metric').mapBy('id'),
      ['metricOne', 'metricTwo', 'metricFive', 'metricThree', 'metricFour'],
      'All query pulls in all metrics'
    );

    assert.deepEqual(
      Service.all('metric', 'bardOne').mapBy('id'),
      ['metricOne', 'metricTwo', 'metricFive'],
      'All query pulls in metrics for bardOne datasource'
    );

    assert.deepEqual(
      Service.all('metric', 'bardTwo').mapBy('id'),
      ['metricThree', 'metricFour'],
      'All query pulls in metrics for bardTwo datasource'
    );
  });

  test('findById', async function(assert) {
    assert.expect(12);
    metadataRoutes.bind(Server)(1);
    Service.set('loadedDataSources', ['bardOne']);
    const metricOne = await Service.findById('metric', 'metricOne', 'bardOne');
    const expectedMetric = {
      id: MetricOne.name,
      name: MetricOne.longName,
      description: MetricOne.description
    };
    assert.ok(
      Object.keys(expectedMetric).every(key => expectedMetric[key] === metricOne[key]),
      'Service findById should load correct data'
    );

    let keg = Service._keg;

    assert.deepEqual(keg.all('metadata/metric').mapBy('id'), ['metricOne'], 'Fetched entity has been added to the keg');

    const data = await Service.findById('metric', 'metricOne');
    assert.ok(
      Object.keys(expectedMetric).every(key => expectedMetric[key] === data[key]),
      'Service findById should return correct data'
    );
    assert.equal(Server.handledRequests.length, 1, 'Meta data endpoint only called once');

    let bardTwoData = await Service.findById('metric', 'metricThree', 'bardTwo');

    assert.equal(
      bardTwoData.id,
      'metricThree',
      'Service findById should return correct data when requesting other datasource'
    );
    assert.equal(Server.handledRequests.length, 2, 'Meta data endpoint called once for each metric');

    const foonction = { id: 'foonction', arguments: [{ id: 'foonctionArg' }] };
    const partiallyLoadedMetric = {
      id: MetricSix.name,
      name: MetricSix.longName,
      category: MetricSix.category,
      columnFunctionId: 'foonction',
      partialData: true
    };

    keg.push('metadata/column-function', foonction, { namespace: 'bardOne' });
    keg.push('metadata/metric', partiallyLoadedMetric, { namespace: 'bardOne' });

    const kegRecord = keg.getById('metadata/metric', 'metricSix', 'bardOne');
    assert.ok(kegRecord.partialData, 'Partial metric exists in keg with partial data flag');

    const partialLoadExpectedMetric = {
      id: partiallyLoadedMetric.id,
      name: partiallyLoadedMetric.name,
      category: partiallyLoadedMetric.category,
      columnFunctionId: partiallyLoadedMetric.columnFunctionId
    };

    const findOnPartiallyLoadedMetric = await Service.findById('metric', 'metricSix', 'bardOne');
    assert.ok(
      Object.keys(partialLoadExpectedMetric).every(
        key => partialLoadExpectedMetric[key] === findOnPartiallyLoadedMetric[key]
      ),
      'Correct metric is returned'
    );
    assert.notOk(
      findOnPartiallyLoadedMetric.partialData,
      'Partial data flag is no longer present after direct access of metric'
    );
    assert.equal(Server.handledRequests.length, 3, 'Another request is sent for a partially loaded model');

    const findAgain = await Service.findById('metric', 'metricSix', 'bardOne');
    assert.equal(findAgain, findOnPartiallyLoadedMetric, 'Same record is returned on a second call');
    assert.equal(Server.handledRequests.length, 3, 'No more requests are sent for subsequent findById calls');

    Service.set('loadedDataSources', []);
  });

  test('getMetaField', async function(assert) {
    assert.expect(3);
    await Service.loadMetadata();
    assert.equal(Service.getMetaField('metric', 'metricOne', 'name'), 'Metric One', 'gets field from requested');

    assert.equal(
      Service.getMetaField('metric', 'metricOne', 'shortName', 'someDefault'),
      'someDefault',
      'returns default when field is not found'
    );

    assert.equal(
      Service.getMetaField('metric', 'InvalidMetric', 'shortName', 'someDefault'),
      'someDefault',
      'returns default when metric is not found'
    );
  });

  test('multi datasource getMetaField', async function(assert) {
    assert.expect(5);
    metadataRoutes.bind(Server)(1);
    await Service.loadMetadata({ dataSourceName: 'bardOne' });
    await Service.loadMetadata({ dataSourceName: 'bardTwo' });
    assert.equal(
      Service.getMetaField('metric', 'metricOne', 'name', null, 'bardOne'),
      'Metric One',
      'gets field from requested bardOne datasource'
    );
    assert.equal(
      Service.getMetaField('metric', 'metricThree', 'name', null, 'bardTwo'),
      'Metric Three',
      'gets field from requested bardTwo data source'
    );

    assert.equal(
      Service.getMetaField('metric', 'metricOne', 'shortName', 'someDefault', 'bardOne'),
      'someDefault',
      'returns default when field is not found'
    );

    assert.equal(
      Service.getMetaField('metric', 'InvalidMetric', 'shortName', 'someDefault', 'bardOne'),
      'someDefault',
      'returns default when metric is not found'
    );

    assert.equal(
      Service.getMetaField('metric', 'metricOne', 'name', 'someDefault', 'bardTwo'),
      'someDefault',
      'Returns default when metric can not be found in given namespace'
    );
  });
});
