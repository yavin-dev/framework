import { module, test } from 'qunit';
import TableMetadataModel, { TableMetadataPayload } from '@yavin/client/models/metadata/table';
import MetricMetadataModel from '@yavin/client/models/metadata/metric';
import DimensionMetadataModel from '@yavin/client/models/metadata/dimension';
import TimeDimensionMetadataModel from '@yavin/client/models/metadata/time-dimension';
import RequestConstraintMetadataModel from '@yavin/client/models/metadata/request-constraint';
import { ValueSourceType } from '@yavin/client/models/metadata/elide/dimension';
import { Mock, nullInjector } from '../../../helpers/injector';
import type MetadataServiceInterface from '@yavin/client/services/interfaces/metadata';
import MetadataModelRegistry from '@yavin/client/models/metadata/registry';

type RecordsById<Registry> = Partial<{
  [P in keyof Registry]: Record<string, Registry[P]>;
}>;

class MockMetadataService implements Partial<MetadataServiceInterface> {
  mocks: RecordsById<MetadataModelRegistry> = {
    metric: {
      pv: new MetricMetadataModel(nullInjector, {
        id: 'pv',
        name: 'Page Views',
        description: 'Page Views',
        category: 'Page Views',
        source: 'bardOne',
        isSortable: true,
        type: 'field',
      }),
    },
    dimension: {
      age: new DimensionMetadataModel(nullInjector, {
        id: 'age',
        name: 'Age',
        description: 'Age',
        category: 'category',
        source: 'bardOne',
        isSortable: false,
        type: 'field',
        valueSourceType: ValueSourceType.TABLE,
      }),
    },
    timeDimension: {
      orderDate: new TimeDimensionMetadataModel(nullInjector, {
        id: 'orderDate',
        name: 'Order Date',
        description: 'Order Date',
        category: 'category',
        source: 'bardOne',
        isSortable: true,
        supportedGrains: [],
        timeZone: 'UTC',
        type: 'field',
        valueSourceType: ValueSourceType.NONE,
      }),
    },
    requestConstraint: {
      constraint: new RequestConstraintMetadataModel(nullInjector, {
        id: 'constraint',
        name: 'Constraint',
        description: 'Constraint',
        type: 'existence',
        constraint: {
          property: 'columns',
          matches: { type: 'metric', field: 'test' },
        },
        source: 'bardOne',
      }),
    },
  };
  getById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    _dataSourceName: string
  ): MetadataModelRegistry[K] | undefined {
    return this.mocks[type]?.[id];
  }
}

let Payload: TableMetadataPayload;
let Model: TableMetadataModel;
let MetadataService: MetadataServiceInterface;

module('Unit | Metadata Model | Table', function (hooks) {
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

    MetadataService = new MockMetadataService() as unknown as MetadataServiceInterface;
    Model = new TableMetadataModel(Mock().meta(MetadataService).build(), Payload);
  });

  test('factory has identifierField defined', function (assert) {
    assert.expect(1);

    assert.equal(TableMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
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
      MetadataService.getById('metric', 'pv', 'bardOne'),
      'The Page view metric is properly hydrated'
    );
  });

  test('Dimension in Table', function (assert) {
    assert.expect(1);

    assert.equal(
      Model.dimensions[0],
      MetadataService.getById('dimension', 'age', 'bardOne'),
      'The age dimension is properly hydrated'
    );
  });

  test('Time Dimension in Table', function (assert) {
    assert.expect(1);

    assert.equal(
      Model.timeDimensions[0],
      MetadataService.getById('timeDimension', 'orderDate', 'bardOne'),
      'The Order date time-dimension is properly hydrated'
    );
  });

  test('Request Constraint in Table', function (assert) {
    assert.expect(1);

    assert.equal(
      Model.requestConstraints[0],
      MetadataService.getById('requestConstraint', 'constraint', 'bardOne'),
      'The requestConstraint is properly hydrated'
    );
  });
});
