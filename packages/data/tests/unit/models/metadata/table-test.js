import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

const { assign, get, getOwner } = Ember;

let Payload,
    Model,
    TimeGrain,
    Keg,
    TableFactory;

moduleFor('model:metadata/table', 'Unit | Metadata Model | Table', {
  needs: [
    'service:keg',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain'
  ],

  beforeEach() {
    let timeGrain = {
      name: 'day',
      longName: 'Day',
      description: 'Day',
      metricIds: [ 'pv' ],
      keg: Keg
    };

    Payload = {
      name: 'tableA',
      description: 'Table A',
      longName: 'Table A',
      timeGrains: [ timeGrain ],
      category: 'table',
    };

    Model = this.subject(Payload);

    //Looking up and injecting keg into the model
    Keg = getOwner(Model).lookup('service:keg');

    Keg.push('metadata/metric', {
      id: 'pv',
      name: 'Page Views',
      longName: 'Page Views',
      category: 'Page Views'
    });

    let timeGrainPayload = assign({}, timeGrain);
    TimeGrain = getOwner(this).factoryFor('model:metadata/time-grain').create(timeGrainPayload);
    TableFactory = getOwner(this).factoryFor('model:metadata/table').class;
  }
});

test('factory has identifierField defined', function(assert) {
  assert.expect(1);

  assert.equal(get(TableFactory, 'identifierField'),
    'name',
    'identifierField property is set to `name`');
});

test('it properly hydrates properties', function(assert) {
  assert.expect(5);

  assert.deepEqual(get(Model, 'name'),
    Payload.name,
    'name property is hydrated properly');

  assert.equal(get(Model, 'longName'),
    Payload.longName,
    'longName property was properly hydrated');

  assert.equal(get(Model, 'description'),
    Payload.description,
    'description property was properly hydrated');

  assert.equal(get(Model, 'category'),
    Payload.category,
    'category property was properly hydrated');

  assert.deepEqual(get(Model, 'timeGrains'),
    [ TimeGrain ],
    'timeGrains property was properly hydrated');
});

test('Metric in Time Grain', function(assert) {
  assert.expect(1);

  assert.deepEqual(get(Model, 'timeGrains.firstObject.metrics.firstObject'),
    Keg.getById('metadata/metric', 'pv'),
    'The Page view metric is properly hydrated');
});
