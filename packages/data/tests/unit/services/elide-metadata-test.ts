import { module, test } from 'qunit';
import { setupTest, skip } from 'ember-qunit';
//@ts-ignore
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { TestContext } from 'ember-test-helpers';
import ElideMetadataService from 'navi-data/services/elide-metadata';
import TableMetadataModel, { TableMetadata } from 'navi-data/models/metadata/table';
import DimensionMetadataModel, { DimensionMetadata } from 'navi-data/models/metadata/dimension';
import MetricMetadataModel, { MetricMetadata, MetricMetadataPayload } from 'navi-data/models/metadata/metric';
import TimeDimensionMetadataModel, { TimeDimensionMetadata } from 'navi-data/models/metadata/time-dimension';
import DummyScenario from 'dummy/mirage/scenarios/graphql';
import BlockheadScenario from 'dummy/mirage/scenarios/graphql-blockhead';

type MirageTestContext = TestContext & { server?: TODO };

let Service: ElideMetadataService;

module('Unit | Service | elide-metadata', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function(this: MirageTestContext) {
    Service = this.owner.lookup('service:elide-metadata');
  });

  test('it exists', function(assert) {
    assert.ok(Service);
  });

  test('loadMetadata', async function(assert) {
    // Seed our mirage database
    DummyScenario((this as MirageTestContext).server);
    await Service.loadMetadata();

    const keg = Service._keg;

    assert.deepEqual(
      Object.keys(keg.idIndexes).sort(),
      ['metadata/dimension', 'metadata/metric', 'metadata/table', 'metadata/time-dimension'],
      'All the expected metadata types are loaded into the keg after load'
    );

    assert.deepEqual(keg.all('metadata/table').mapBy('id'), ['table0', 'table1'], 'All tables are loaded in the keg');

    assert.deepEqual(keg.all('metadata/dimension').mapBy('id'), ['dimension0'], 'All dimensions are loaded in the keg');

    assert.deepEqual(
      keg.all('metadata/metric').mapBy('id'),
      ['metric0', 'metric1', 'metric2', 'metric3'],
      'All metrics are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/time-dimension').mapBy('id'),
      ['timeDimension0'],
      'All time-dimensions are loaded in the keg'
    );

    assert.deepEqual(Service.loadedDataSources, ['dummy'], 'One datasource should be loaded');
  });

  test('loadMetadata from multiple sources', async function(assert) {
    const Server = (this as MirageTestContext).server;
    // Seed our mirage database
    DummyScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'dummy' });
    Server.db.emptyData();
    BlockheadScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'blockhead' });

    const keg = Service._keg;

    assert.deepEqual(
      Object.keys(keg.idIndexes).sort(),
      ['metadata/dimension', 'metadata/metric', 'metadata/table', 'metadata/time-dimension'],
      'All the expected metadata types are loaded into the keg after load'
    );

    assert.deepEqual(
      keg.all('metadata/table').map((table: TableMetadata) => ({ id: table.id, source: table.source })),
      [
        { id: 'table0', source: 'dummy' },
        { id: 'table1', source: 'dummy' },
        { id: 'table2', source: 'blockhead' },
        { id: 'table3', source: 'blockhead' }
      ],
      'All tables are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/dimension').map((dim: DimensionMetadata) => ({ id: dim.id, source: dim.source })),
      [
        { id: 'dimension0', source: 'dummy' },
        { id: 'dimension1', source: 'blockhead' },
        { id: 'dimension2', source: 'blockhead' },
        { id: 'dimension3', source: 'blockhead' },
        { id: 'dimension4', source: 'blockhead' },
        { id: 'dimension5', source: 'blockhead' }
      ],
      'All dimensions are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/metric').map((metric: MetricMetadata) => ({ id: metric.id, source: metric.source })),
      [
        { id: 'metric0', source: 'dummy' },
        { id: 'metric1', source: 'dummy' },
        { id: 'metric2', source: 'dummy' },
        { id: 'metric3', source: 'dummy' },
        { id: 'metric4', source: 'blockhead' },
        { id: 'metric5', source: 'blockhead' }
      ],
      'All metrics are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/time-dimension').map((t: TimeDimensionMetadata) => ({ id: t.id, source: t.source })),
      [
        { id: 'timeDimension0', source: 'dummy' },
        { id: 'timeDimension1', source: 'blockhead' },
        { id: 'timeDimension2', source: 'blockhead' }
      ],
      'All time-dimensions are loaded in the keg'
    );

    assert.deepEqual(Service.loadedDataSources, ['dummy', 'blockhead'], 'Two datasources should be loaded');
  });

  test('loadMetadata after data loaded', async function(assert) {
    assert.expect(1);

    const result = await Service.loadMetadata();
    assert.notOk(result, 'loadMetadata returns a promise that resolves to nothing when metadata is already loaded');
  });

  test('_loadMetadataForType', async function(assert) {
    assert.expect(1);

    let keg = this.owner.lookup('service:keg'),
      testMetric: MetricMetadataPayload = {
        id: 'foo',
        description: 'foo',
        name: 'Foo',
        category: 'foo',
        defaultFormat: 'bar',
        tableId: 'baz',
        source: 'dummy',
        valueType: 'NUMBER',
        type: 'field',
        tags: []
      };

    await Service._loadMetadataForType('metric', [testMetric], 'dummy');

    let record = keg.getById('metadata/metric', 'foo', 'dummy');

    assert.deepEqual(
      {
        id: record.id,
        description: record.description,
        name: record.name,
        category: record.category,
        defaultFormat: record.defaultFormat,
        tableId: record.tableId,
        source: record.source,
        valueType: record.valueType,
        type: record.type,
        tags: record.tags
      },
      testMetric,
      'The testMetric has been pushed to the keg'
    );
  });

  test('all method', async function(assert) {
    assert.expect(12);

    const Server = (this as MirageTestContext).server;
    // Seed our mirage database
    DummyScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'dummy' });
    Server.db.emptyData();
    BlockheadScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'blockhead' });

    const allTables = Service.all('table');
    assert.ok(
      allTables.every((t: TableMetadataModel) => t instanceof TableMetadataModel),
      'all method returns table metadata models'
    );
    assert.deepEqual(
      allTables.mapBy('id'),
      ['table0', 'table1', 'table2', 'table3'],
      'All tables are returned for all datasources when no source is specified'
    );

    const allDimensions = Service.all('dimension');
    assert.ok(
      allDimensions.every((d: DimensionMetadataModel) => d instanceof DimensionMetadataModel),
      'all method returns dimension metadata models'
    );
    assert.deepEqual(
      allDimensions.mapBy('id'),
      ['dimension0', 'dimension1', 'dimension2', 'dimension3', 'dimension4', 'dimension5'],
      'all method returns all loaded dimensions for every source'
    );

    const allMetrics = Service.all('metric');
    assert.ok(
      allMetrics.every((m: MetricMetadataModel) => m instanceof MetricMetadataModel),
      'all method returns metric metadata models'
    );
    assert.deepEqual(
      allMetrics.mapBy('id'),
      ['metric0', 'metric1', 'metric2', 'metric3', 'metric4', 'metric5'],
      'all method returns all loaded metrics for every source'
    );

    const allTimeDimensions = Service.all('time-dimension');
    assert.ok(
      allTimeDimensions.every((d: TimeDimensionMetadataModel) => d instanceof TimeDimensionMetadataModel),
      'all method returns time-dimension metadata models'
    );
    assert.deepEqual(
      allTimeDimensions.mapBy('id'),
      ['timeDimension0', 'timeDimension1', 'timeDimension2'],
      'all method returns all loaded time-dimensions for every source'
    );

    const allDummyMetrics = Service.all('metric', 'dummy');
    assert.ok(
      allDummyMetrics.every((m: MetricMetadataModel) => m instanceof MetricMetadataModel),
      'all method returns metric metadata models'
    );
    assert.deepEqual(
      allDummyMetrics.mapBy('id'),
      ['metric0', 'metric1', 'metric2', 'metric3'],
      'all method returns all loaded metrics for only the specified source'
    );

    assert.throws(
      () => {
        // @ts-ignore
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
    assert.expect(7);

    const keg = this.owner.lookup('service:keg');
    const Server = (this as MirageTestContext).server;
    // Seed our mirage database
    DummyScenario(Server);
    await Service.loadMetadata();

    assert.equal(
      Service.getById('table', 'table1'),
      keg.getById('metadata/table', 'table1', 'dummy'),
      'Table1 is fetched from the keg using getById'
    );

    assert.equal(
      Service.getById('dimension', 'dimension1'),
      keg.getById('metadata/dimension', 'dimension1', 'dummy'),
      'Dimension1 is fetched from the keg using getById'
    );

    assert.equal(
      Service.getById('metric', 'metric0'),
      keg.getById('metadata/metric', 'metric0', 'dummy'),
      'Metric0 is fetched from the keg using getById'
    );

    assert.equal(
      Service.getById('time-dimension', 'timeDimension0'),
      keg.getById('metadata/time-dimension', 'timeDimension0', 'dummy'),
      'Time Dimension 0 is fetched from the keg using getById'
    );

    //@ts-ignore
    assert.equal(Service.getById('metric'), undefined, 'getById returns undefined when no id is passed');

    assert.throws(
      () => {
        //@ts-ignore
        Service.getById('foo');
      },
      new Error('Assertion Failed: Type must be a valid navi-data model type'),
      'Service `getById` method throws error when metadata type is invalid'
    );

    Service.set('loadedDataSources', []);

    assert.throws(
      () => {
        //@ts-ignore
        Service.getById('metric');
      },
      new Error('Assertion Failed: Metadata must be loaded before the operation can be performed'),
      'Service `getById` method throws error when metadata is not loaded'
    );
  });

  test('findById', async function(assert) {
    const keg = this.owner.lookup('service:keg');
    const Server = (this as MirageTestContext).server;
    // Seed our mirage database
    DummyScenario(Server);
    await Service.loadMetadata();

    assert.equal(
      await Service.findById('table', 'table1'),
      keg.getById('metadata/table', 'table1', 'dummy'),
      'Table1 is fetched from the keg using getById'
    );

    //TODO: Add tests when fetchById is implemented
  });

  test('getMetaField', async function(assert) {
    assert.expect(5);
    const Server = (this as MirageTestContext).server;
    // Seed our mirage database
    DummyScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'dummy' });
    Server.db.emptyData();
    BlockheadScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'blockhead' });

    assert.equal(Service.getMetaField('metric', 'metric1', 'name'), 'Metric 1', 'gets field from requested metadata');

    assert.equal(
      Service.getMetaField('metric', 'metric5', 'name', undefined, 'blockhead'),
      'Metric 5',
      'gets field from requested metadata for a given datasource'
    );

    assert.equal(
      Service.getMetaField('metric', 'metric5', 'name', 'foo', 'dummy'),
      'foo',
      'returns default when metadata is not found in given datasource'
    );

    assert.equal(
      Service.getMetaField('metric', 'metric1', 'shortName', 'someDefault'),
      'someDefault',
      'returns default when field is not found'
    );

    assert.equal(
      Service.getMetaField('metric', 'InvalidMetric', 'shortName', 'someDefault'),
      'someDefault',
      'returns default when metric is not found'
    );
  });

  skip('fetchById', async function(assert) {
    //TODO: Implement this test when fetchById is supported
    assert.ok(false);
  });
});
