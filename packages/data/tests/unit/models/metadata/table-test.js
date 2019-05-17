import { assign } from '@ember/polyfills';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

let Payload, Model, TimeGrain, Keg, TableFactory;

module('Unit | Metadata Model | Table', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    let timeGrain = {
      name: 'day',
      longName: 'Day',
      description: 'Day',
      dimensionIds: [],
      metricIds: ['pv'],
      keg: Keg
    };

    Payload = {
      name: 'tableA',
      description: 'Table A',
      longName: 'Table A',
      timeGrains: [timeGrain],
      category: 'table'
    };

    Model = run(() => this.owner.factoryFor('model:metadata/table').create(Payload));

    //Looking up and injecting keg into the model
    Keg = this.owner.lookup('service:keg');

    Keg.push('metadata/metric', {
      id: 'pv',
      name: 'Page Views',
      longName: 'Page Views',
      category: 'Page Views'
    });

    let timeGrainPayload = assign({}, timeGrain);
    TimeGrain = this.owner.factoryFor('model:metadata/time-grain').create(timeGrainPayload);
    TableFactory = this.owner.factoryFor('model:metadata/table').class;
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(get(TableFactory, 'identifierField'), 'name', 'identifierField property is set to `name`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(5);

    assert.deepEqual(get(Model, 'name'), Payload.name, 'name property is hydrated properly');

    assert.equal(get(Model, 'longName'), Payload.longName, 'longName property was properly hydrated');

    assert.equal(get(Model, 'description'), Payload.description, 'description property was properly hydrated');

    assert.equal(get(Model, 'category'), Payload.category, 'category property was properly hydrated');

    assert.deepEqual(get(Model, 'timeGrains'), [TimeGrain], 'timeGrains property was properly hydrated');
  });

  test('Metric in Time Grain', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      get(Model, 'timeGrains.firstObject.metrics.firstObject'),
      Keg.getById('metadata/metric', 'pv'),
      'The Page view metric is properly hydrated'
    );
  });
});
