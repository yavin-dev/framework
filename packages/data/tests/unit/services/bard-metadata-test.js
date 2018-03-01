import Ember from  'ember';
import { moduleFor, test } from 'ember-qunit';
import Pretender from "pretender";
import metadataRoutes, {
  TableOne,
  TableTwo,
  DimensionOne,
  DimensionTwo,
  DimensionThree,
  MetricOne,
  MetricTwo,
  Host
} from '../../helpers/metadata-routes';


const { getOwner, setOwner } = Ember;

let Service,
    Server;

moduleFor('service:bard-metadata', 'Unit - Service - Bard Metadata', {
  needs: [
    'adapter:bard-metadata',
    'serializer:bard-metadata',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'service:ajax',
    'service:keg'
  ],

  beforeEach() {
    Service = this.subject({
      host: Host
    });
    setOwner(Service, getOwner(this));

    //setup Pretender
    Server = new Pretender(metadataRoutes);
  },

  afterEach(){
    //shutdown pretender
    Server.shutdown();
  }
});

test('Service Exists', function(assert) {
  assert.ok(!!Service, 'Service exists');
});

test('loadMetadata', function(assert) {
  assert.expect(4);

  return Service.loadMetadata().then(() => {
    let keg = Service.get('_keg');

    assert.deepEqual(keg.all('metadata/table').mapBy('name'),
      [ TableOne.name, TableTwo.name ],
      'All tables are loaded in the keg');

    assert.deepEqual(keg.all('metadata/dimension').mapBy('name'),
      [ DimensionOne.name, DimensionThree.name, DimensionTwo.name ],
      'All dimensions are loaded in the keg');

    assert.deepEqual(keg.all('metadata/metric').mapBy('name'),
      [ MetricOne.name, MetricTwo.name ],
      'All metrics are loaded in the keg');

    assert.ok(Service.get('metadataLoaded'),
      'metadataLoaded property is set to true after data is loaded');
  });
});

test('loadMetadata after data loaded', function(assert) {
  assert.expect(1);

  Service.loadMetadata().then(result => {
    assert.notOk(result,
      'loadMetadata returns a promise that resolves to nothing when metadata is already loaded');
  });
});

test('_loadMetadataForType', function(assert) {
  assert.expect(1);

  getOwner(this).register('model:metadata/record', Ember.Object.extend());

  let keg = getOwner(this).lookup('service:keg'),
      testRecord = {id: 'foo', description: 'foo'};

  Service._loadMetadataForType('record', [ testRecord ]);

  let record = keg.getById('metadata/record', 'foo');

  assert.deepEqual({ id: record.get('id'), description: record.get('description') },
    testRecord,
    'The testRecord has been pushed to the keg');
});

test('all method', function(assert) {
  assert.expect(5);

  return Service.loadMetadata().then(() => {
    assert.deepEqual(Service.all('table').mapBy('name'),
      [ TableOne.name, TableTwo.name ],
      'all method returns all loaded tables');

    assert.deepEqual(Service.all('dimension').mapBy('name'),
      [ DimensionOne.name, DimensionThree.name, DimensionTwo.name ],
      'all method returns all loaded dimensions');

    assert.deepEqual(Service.all('metric').mapBy('name'),
      [ MetricOne.name, MetricTwo.name ],
      'all method returns all loaded metrics');

    assert.throws(() => {
      Service.all('foo');
    },
    new Error('Assertion Failed: Type must be table, metric or dimension'),
    'Service `all` method throws error when metadata type is invalid');

    Service.set('metadataLoaded', false);

    assert.throws(() => {
      Service.all('metric');
    },
    new Error('Assertion Failed: Metadata must be loaded before the operation can be performed'),
    'Service `all` method throws error when metadata is not loaded');
  });
});

test('getById', function(assert){
  assert.expect(6);

  return Service.loadMetadata().then(() => {
    let keg = getOwner(Service).lookup('service:keg');

    assert.equal(Service.getById('table', 'table1'),
      keg.getById('metadata/table', 'table1'),
      'Table1 is fetched from the keg using getMetadtaById');

    assert.equal(Service.getById('dimension', 'dimensionOne'),
      keg.getById('metadata/dimension', 'dimensionOne'),
      'DimensionOne is fetched from the keg using getMetadtaById');

    assert.equal(Service.getById('metric', 'metricOne'),
      keg.getById('metadata/metric', 'metricOne'),
      'MetricOne is fetched from the keg using getMetadtaById');

    assert.equal(Service.getById('metric'),
      undefined,
      'getById returns undefined when no id is passed');

    assert.throws(() => {
      Service.getById('foo');
    },
    new Error('Assertion Failed: Type must be table, metric or dimension'),
    'Service `getById` method throws error when metadata type is invalid');

    Service.set('metadataLoaded', false);

    assert.throws(() => {
      Service.getById('metric');
    },
    new Error('Assertion Failed: Metadata must be loaded before the operation can be performed'),
    'Service `getById` method throws error when metadata is not loaded');
  });
});

test('fetchById', function(assert){
  assert.expect(3);

  Service.fetchById('metric', 'metricOne').then((data) => {
    assert.deepEqual(data,
      MetricOne,
      'Service fetchById should load correct data');

    let keg = Service.get('_keg');

    assert.deepEqual(keg.all('metadata/metric').mapBy('name'),
      [ 'metricOne' ],
      'Fetched entity has been added to the keg');
  });

  Service.fetchById('metric', 'metricOne').then(() => {
    let keg = Service.get('_keg');

    assert.deepEqual(keg.all('metadata/metric').mapBy('name'),
      [ 'metricOne' ],
      'Fetching an entity already present in the keg doesn`t add another copy into the keg');
  });
});

test('getMetaField', function(assert) {
  assert.expect(3);
  return Service.loadMetadata().then(() => {
    assert.equal(Service.getMetaField('metric', 'metricOne', 'longName'),
      'Metric One',
      'gets field from requested');

    assert.equal(Service.getMetaField('metric', 'metricOne', 'shortName', 'someDefault'),
      'someDefault',
      'returns default when field is not found');

    assert.equal(Service.getMetaField('metric', 'InvalidMetric', 'shortName', 'someDefault'),
      'someDefault',
      'returns default when metric is not found');
  });
});
