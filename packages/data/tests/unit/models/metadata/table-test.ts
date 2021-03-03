import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import TableMetadataModel, { TableMetadataPayload } from 'navi-data/models/metadata/table';
import KegService from 'navi-data/services/keg';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Payload: TableMetadataPayload, Model: TableMetadataModel, Keg: KegService, TableFactory: any;

module('Unit | Metadata Model | Table', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    Payload = {
      id: 'tableA',
      name: 'Table A',
      description: 'Table A',
      category: 'table',
      cardinality: 'LARGE',
      metricIds: ['pv'],
      dimensionIds: ['age'],
      timeDimensionIds: ['orderDate'],
      requestConstraintIds: ['constraint'],
      isFact: true,
      source: 'bardOne',
      tags: ['DISPLAY'],
    };

    Model = this.owner.factoryFor('model:metadata/table').create(Payload);

    //Looking up and injecting keg into the model
    Keg = this.owner.lookup('service:keg');

    Keg.push(
      'metadata/metric',
      {
        id: 'pv',
        name: 'Page Views',
        description: 'Page Views',
        category: 'Page Views',
        source: 'bardOne',
      },
      { namespace: 'bardOne' }
    );
    Keg.push(
      'metadata/dimension',
      {
        id: 'age',
        name: 'Age',
        description: 'Age',
        category: 'category',
        source: 'bardOne',
      },
      { namespace: 'bardOne' }
    );
    Keg.push(
      'metadata/timeDimension',
      {
        id: 'orderDate',
        name: 'Order Date',
        description: 'Order Date',
        category: 'category',
        source: 'bardOne',
      },
      { namespace: 'bardOne' }
    );
    Keg.push(
      'metadata/requestConstraint',
      {
        id: 'constraint',
        name: 'Constraint',
        description: 'Constraint',
        type: 'existence',
        constraint: {},
        source: 'bardOne',
      },
      { namespace: 'bardOne' }
    );

    TableFactory = this.owner.factoryFor('model:metadata/table').class;
  });

  test('factory has identifierField defined', function (assert) {
    assert.expect(1);

    assert.equal(TableFactory.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function (assert) {
    assert.expect(12);

    const {
      id,
      name,
      description,
      category,
      cardinality,
      metricIds,
      dimensionIds,
      timeDimensionIds,
      requestConstraintIds,
      source,
      isFact,
      tags,
    } = Model;

    assert.equal(id, Payload.id, 'id property is hydrated properly');
    assert.equal(name, Payload.name, 'name property is hydrated properly');
    assert.equal(description, Payload.description, 'description property is hydrated properly');
    assert.equal(category, Payload.category, 'category property is hydrated properly');
    assert.equal(cardinality, Payload.cardinality, 'cardinality property is hydrated properly');
    assert.deepEqual(metricIds, Payload.metricIds, 'metricIds property is hydrated properly');
    assert.deepEqual(dimensionIds, Payload.dimensionIds, 'dimensionIds property is hydrated properly');
    assert.deepEqual(timeDimensionIds, Payload.timeDimensionIds, 'timeDimensionIds property is hydrated properly');
    assert.deepEqual(
      requestConstraintIds,
      Payload.requestConstraintIds,
      'requestConstraintIds property is hydrated properly'
    );
    assert.equal(source, Payload.source, 'source property is hydrated properly');
    assert.deepEqual(tags, Payload.tags, 'tags property is hydrated properly');
    assert.deepEqual(isFact, Payload.isFact, 'isFact property is hydrated properly');
  });

  test('Metric in Table', function (assert) {
    assert.expect(1);
    assert.equal(
      Model.metrics[0],
      Keg.getById('metadata/metric', 'pv', 'bardOne'),
      'The Page view metric is properly hydrated'
    );
  });

  test('Dimension in Table', function (assert) {
    assert.expect(1);

    assert.equal(
      Model.dimensions[0],
      Keg.getById('metadata/dimension', 'age', 'bardOne'),
      'The age dimension is properly hydrated'
    );
  });

  test('Time Dimension in Table', function (assert) {
    assert.expect(1);

    assert.equal(
      Model.timeDimensions[0],
      Keg.getById('metadata/timeDimension', 'orderDate', 'bardOne'),
      'The Order date time-dimension is properly hydrated'
    );
  });

  test('Request Constraint in Table', function (assert) {
    assert.expect(1);

    assert.equal(
      Model.requestConstraints[0],
      Keg.getById('metadata/requestConstraint', 'constraint', 'bardOne'),
      'The requestConstraint is properly hydrated'
    );
  });
});
