import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

let Payload, Model, Keg, TableFactory;

module('Unit | Metadata Model | Table', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Payload = {
      id: 'tableA',
      name: 'Table A',
      description: 'Table A',
      category: 'table',
      cardinality: 'LARGE',
      metricIds: ['pv'],
      dimensionIds: ['age'],
      timeDimensionIds: ['orderDate'],
      timeGrainIds: ['day', 'month', 'week'],
      source: 'dummy',
      tags: ['DISPLAY']
    };

    Model = run(() => this.owner.factoryFor('model:metadata/table').create(Payload));

    //Looking up and injecting keg into the model
    Keg = this.owner.lookup('service:keg');

    Keg.push(
      'metadata/metric',
      {
        id: 'pv',
        name: 'Page Views',
        description: 'Page Views',
        category: 'Page Views',
        source: 'dummy'
      },
      { namespace: 'dummy' }
    );
    Keg.push(
      'metadata/dimension',
      {
        id: 'age',
        name: 'Age',
        description: 'Age',
        category: 'category',
        source: 'dummy'
      },
      { namespace: 'dummy' }
    );
    Keg.push(
      'metadata/time-dimension',
      {
        id: 'orderDate',
        name: 'Order Date',
        description: 'Order Date',
        category: 'category',
        source: 'dummy'
      },
      { namespace: 'dummy' }
    );

    TableFactory = this.owner.factoryFor('model:metadata/table').class;
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(TableFactory.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(11);

    const {
      id,
      name,
      description,
      category,
      cardinality,
      metricIds,
      dimensionIds,
      timeDimensionIds,
      source,
      timeGrainIds,
      tags
    } = Model;

    assert.equal(id, Payload.id, 'id property is hydrated properly');
    assert.equal(name, Payload.name, 'name property is hydrated properly');
    assert.equal(description, Payload.description, 'description property is hydrated properly');
    assert.equal(category, Payload.category, 'category property is hydrated properly');
    assert.equal(cardinality, Payload.cardinality, 'cardinality property is hydrated properly');
    assert.deepEqual(metricIds, Payload.metricIds, 'metricIds property is hydrated properly');
    assert.deepEqual(dimensionIds, Payload.dimensionIds, 'dimensionIds property is hydrated properly');
    assert.deepEqual(timeDimensionIds, Payload.timeDimensionIds, 'timeDimensionIds property is hydrated properly');
    assert.equal(source, Payload.source, 'source property is hydrated properly');
    assert.deepEqual(tags, Payload.tags, 'tags property is hydrated properly');
    assert.deepEqual(timeGrainIds, Payload.timeGrainIds, 'timeGrainIds property is hydrated properly');
  });

  test('Metric in Table', function(assert) {
    assert.expect(1);

    assert.equal(
      Model.metrics[0],
      Keg.getById('metadata/metric', 'pv', 'dummy'),
      'The Page view metric is properly hydrated'
    );
  });

  test('Dimension in Table', function(assert) {
    assert.expect(1);

    assert.equal(
      Model.dimensions[0],
      Keg.getById('metadata/dimension', 'age', 'dummy'),
      'The age dimension is properly hydrated'
    );
  });

  test('Time Dimension in Table', function(assert) {
    assert.expect(1);

    assert.equal(
      Model.timeDimensions[0],
      Keg.getById('metadata/time-dimension', 'orderDate', 'dummy'),
      'The Order date time-dimension is properly hydrated'
    );
  });
});
