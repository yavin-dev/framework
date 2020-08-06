import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext } from 'ember-test-helpers';
import ElideMetadataService from 'navi-data/services/elide-metadata';
import TableMetadataModel, { TableMetadata } from 'navi-data/models/metadata/table';
import DimensionMetadataModel, { DimensionMetadata } from 'navi-data/models/metadata/dimension';
import MetricMetadataModel, { MetricMetadata, MetricMetadataPayload } from 'navi-data/models/metadata/metric';
import TimeDimensionMetadataModel, { TimeDimensionMetadata } from 'navi-data/models/metadata/time-dimension';
import ElideOneScenario from 'dummy/mirage/scenarios/elide-one';
import ElideTwoScenario from 'dummy/mirage/scenarios/elide-two';

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
    ElideOneScenario((this as MirageTestContext).server);
    await Service.loadMetadata();

    const keg = Service._keg;

    assert.deepEqual(
      Object.keys(keg.idIndexes).sort(),
      ['metadata/dimension', 'metadata/metric', 'metadata/table', 'metadata/time-dimension'],
      'All the expected metadata types are loaded into the keg after load'
    );

    assert.deepEqual(keg.all('metadata/table').mapBy('id'), ['table0', 'table1'], 'All tables are loaded in the keg');

    assert.deepEqual(
      keg.all('metadata/dimension').mapBy('id'),
      ['dimension0', 'dimension1', 'dimension2'],
      'All dimensions are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/metric').mapBy('id'),
      ['metric0', 'metric1', 'metric2', 'metric3', 'metric4'],
      'All metrics are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/time-dimension').mapBy('id'),
      [
        'eventTimeHour',
        'orderTimeHour',
        'eventTimeDay',
        'orderTimeDay',
        'eventTimeWeek',
        'orderTimeWeek',
        'eventTimeMonth',
        'orderTimeMonth',
        'eventTimeQuarter',
        'orderTimeQuarter',
        'eventTimeYear',
        'orderTimeYear'
      ],
      'All time-dimensions are loaded in the keg'
    );

    assert.deepEqual(Service.loadedDataSources, ['bardOne'], 'One datasource should be loaded');
  });

  test('loadMetadata from multiple sources', async function(assert) {
    const Server = (this as MirageTestContext).server;
    // Seed our mirage database
    ElideOneScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'bardOne' });
    Server.db.emptyData();
    ElideTwoScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'elideTwo' });

    const keg = Service._keg;

    assert.deepEqual(
      Object.keys(keg.idIndexes).sort(),
      ['metadata/dimension', 'metadata/metric', 'metadata/table', 'metadata/time-dimension'],
      'All the expected metadata types are loaded into the keg after load'
    );

    assert.deepEqual(
      keg.all('metadata/table').map((table: TableMetadata) => ({ id: table.id, source: table.source })),
      [
        { id: 'table0', source: 'bardOne' },
        { id: 'table1', source: 'bardOne' },
        { id: 'table2', source: 'elideTwo' },
        { id: 'table3', source: 'elideTwo' }
      ],
      'All tables are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/dimension').map((dim: DimensionMetadata) => ({ id: dim.id, source: dim.source })),
      [
        { id: 'dimension0', source: 'bardOne' },
        { id: 'dimension1', source: 'bardOne' },
        { id: 'dimension2', source: 'bardOne' },
        { id: 'dimension3', source: 'elideTwo' },
        { id: 'dimension4', source: 'elideTwo' },
        { id: 'dimension5', source: 'elideTwo' },
        { id: 'dimension6', source: 'elideTwo' },
        { id: 'dimension7', source: 'elideTwo' }
      ],
      'All dimensions are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/metric').map((metric: MetricMetadata) => ({ id: metric.id, source: metric.source })),
      [
        { id: 'metric0', source: 'bardOne' },
        { id: 'metric1', source: 'bardOne' },
        { id: 'metric2', source: 'bardOne' },
        { id: 'metric3', source: 'bardOne' },
        { id: 'metric4', source: 'bardOne' },
        { id: 'metric5', source: 'elideTwo' },
        { id: 'metric6', source: 'elideTwo' }
      ],
      'All metrics are loaded in the keg'
    );

    assert.deepEqual(
      keg.all('metadata/time-dimension').map((t: TimeDimensionMetadata) => ({ id: t.id, source: t.source })),
      [
        { id: 'eventTimeHour', source: 'elideOne' },
        { id: 'orderTimeHour', source: 'elideOne' },
        { id: 'eventTimeDay', source: 'elideOne' },
        { id: 'orderTimeDay', source: 'elideOne' },
        { id: 'eventTimeWeek', source: 'elideOne' },
        { id: 'orderTimeWeek', source: 'elideOne' },
        { id: 'eventTimeMonth', source: 'elideOne' },
        { id: 'orderTimeMonth', source: 'elideOne' },
        { id: 'eventTimeQuarter', source: 'elideOne' },
        { id: 'orderTimeQuarter', source: 'elideOne' },
        { id: 'eventTimeYear', source: 'elideOne' },
        { id: 'orderTimeYear', source: 'elideOne' },
        { id: 'eventTimeHour', source: 'elideTwo' },
        { id: 'eventTimeDay', source: 'elideTwo' },
        { id: 'eventTimeWeek', source: 'elideTwo' },
        { id: 'eventTimeMonth', source: 'elideTwo' },
        { id: 'eventTimeQuarter', source: 'elideTwo' },
        { id: 'eventTimeYear', source: 'elideTwo' }
      ],
      'All time-dimensions are loaded in the keg'
    );

    assert.deepEqual(Service.loadedDataSources, ['bardOne', 'elideTwo'], 'Two datasources should be loaded');
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
        source: 'bardOne',
        valueType: 'NUMBER',
        type: 'field',
        tags: []
      };

    await Service._loadMetadataForType('metric', [testMetric], 'bardOne');

    let record = keg.getById('metadata/metric', 'foo', 'bardOne');

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
    ElideOneScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'bardOne' });
    Server.db.emptyData();
    ElideTwoScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'elideTwo' });

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
      ['dimension0', 'dimension1', 'dimension2', 'dimension3', 'dimension4', 'dimension5', 'dimension6', 'dimension7'],
      'all method returns all loaded dimensions for every source'
    );

    const allMetrics = Service.all('metric');
    assert.ok(
      allMetrics.every((m: MetricMetadataModel) => m instanceof MetricMetadataModel),
      'all method returns metric metadata models'
    );
    assert.deepEqual(
      allMetrics.mapBy('id'),
      ['metric0', 'metric1', 'metric2', 'metric3', 'metric4', 'metric5', 'metric6'],
      'all method returns all loaded metrics for every source'
    );

    const allTimeDimensions = Service.all('time-dimension');
    assert.ok(
      allTimeDimensions.every((d: TimeDimensionMetadataModel) => d instanceof TimeDimensionMetadataModel),
      'all method returns time-dimension metadata models'
    );
    assert.deepEqual(
      allTimeDimensions.mapBy('id'),
      [
        'eventTimeHour',
        'orderTimeHour',
        'eventTimeDay',
        'orderTimeDay',
        'eventTimeWeek',
        'orderTimeWeek',
        'eventTimeMonth',
        'orderTimeMonth',
        'eventTimeQuarter',
        'orderTimeQuarter',
        'eventTimeYear',
        'orderTimeYear',
        'eventTimeHour',
        'eventTimeDay',
        'eventTimeWeek',
        'eventTimeMonth',
        'eventTimeQuarter',
        'eventTimeYear'
      ],
      'all method returns all loaded time-dimensions for every source'
    );

    const allBardOneMetrics = Service.all('metric', 'bardOne');
    assert.ok(
      allBardOneMetrics.every((m: MetricMetadataModel) => m instanceof MetricMetadataModel),
      'all method returns metric metadata models'
    );
    assert.deepEqual(
      allBardOneMetrics.mapBy('id'),
      ['metric0', 'metric1', 'metric2', 'metric3', 'metric4'],
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
    ElideOneScenario(Server);
    await Service.loadMetadata();

    assert.equal(
      Service.getById('table', 'table1'),
      keg.getById('metadata/table', 'table1', 'bardOne'),
      'Table1 is fetched from the keg using getById'
    );

    assert.equal(
      Service.getById('dimension', 'dimension1'),
      keg.getById('metadata/dimension', 'dimension1', 'bardOne'),
      'Dimension1 is fetched from the keg using getById'
    );

    assert.equal(
      Service.getById('metric', 'metric0'),
      keg.getById('metadata/metric', 'metric0', 'bardOne'),
      'Metric0 is fetched from the keg using getById'
    );

    assert.equal(
      Service.getById('time-dimension', 'timeDimension0'),
      keg.getById('metadata/time-dimension', 'timeDimension0', 'bardOne'),
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
    ElideOneScenario(Server);
    await Service.loadMetadata();

    assert.equal(
      await Service.findById('table', 'table1'),
      keg.getById('metadata/table', 'table1', 'bardOne'),
      'Table1 is fetched from the keg using getById'
    );

    //TODO: Add tests when fetchById is implemented
  });

  test('getMetaField', async function(assert) {
    assert.expect(5);
    const Server = (this as MirageTestContext).server;
    // Seed our mirage database
    ElideOneScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'bardOne' });
    Server.db.emptyData();
    ElideTwoScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'elideTwo' });

    assert.equal(Service.getMetaField('metric', 'metric1', 'name'), 'Metric 1', 'gets field from requested metadata');

    assert.equal(
      Service.getMetaField('metric', 'metric5', 'name', undefined, 'elideTwo'),
      'Metric 5',
      'gets field from requested metadata for a given datasource'
    );

    assert.equal(
      Service.getMetaField('metric', 'metric5', 'name', 'foo', 'bardOne'),
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

  test('fetchById', async function(assert) {
    assert.expect(1);

    //TODO: Implement this test when fetchById is supported
    assert.throws(
      () => {
        Service.fetchById();
      },
      new Error('Assertion Failed: elide-metadata.fetchById must be defined before it can be called'),
      "Service `fetchById` method throws error because it's not implemented yet"
    );
  });

  test('getTableNamespace', async function(assert) {
    assert.expect(3);

    const Server = (this as MirageTestContext).server;
    // Seed our mirage database
    ElideOneScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'bardOne' });
    Server.db.emptyData();
    ElideTwoScenario(Server);
    await Service.loadMetadata({ dataSourceName: 'elideTwo' });

    assert.equal(Service.getTableNamespace('table0'), 'bardOne', 'Correct table namespace is shown');
    assert.equal(
      Service.getTableNamespace('table2'),
      'elideTwo',
      'Correct table namespace is returned for non-default source'
    );

    assert.equal(Service.getTableNamespace('foo'), 'bardOne', 'Default namespace returned when table not found');
  });
});
