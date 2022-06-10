import { module, test } from 'qunit';
import FunctionParameterMetadataModel, {
  DataType,
  FunctionParameterMetadataPayload,
} from '@yavin/client/models/metadata/function-parameter';
import { ValueSourceType } from '@yavin/client/models/metadata/elide/dimension';
import { nullInjector } from '../../../helpers/injector';
import NaviDimensionResponse from '@yavin/client/models/navi-dimension-response';
import NaviDimensionModel from '@yavin/client/models/navi-dimension';
import type DimensionService from '@yavin/client/services/interfaces/dimension';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import type { ClientServices } from '@yavin/client/models/native-with-create';
import type MetadataService from '@yavin/client/services/interfaces/metadata';
import type MetadataModelRegistry from '@yavin/client/models/metadata/registry';

let Payload: FunctionParameterMetadataPayload;
let FunctionParameter: FunctionParameterMetadataModel;

module('Unit | Metadata Model | Function Parameter', function (hooks) {
  hooks.beforeEach(async function () {
    Payload = {
      id: 'currency',
      name: 'Currency',
      valueType: DataType.TEXT,
      source: 'bardOne',
      valueSourceType: ValueSourceType.ENUM,
      _localValues: [
        { id: 'USD', name: 'US Dollars' },
        { id: 'EUR', name: 'Euros' },
      ],
      defaultValue: 'USD',
    };

    FunctionParameter = new FunctionParameterMetadataModel(nullInjector, Payload);
  });

  test('it properly hydrates properties', function (assert) {
    assert.deepEqual(FunctionParameter.id, Payload.id, 'id property is hydrated properly');
    assert.equal(FunctionParameter.name, Payload.name, 'name property was properly hydrated');
    assert.equal(FunctionParameter.valueType, Payload.valueType, 'valueType property was properly hydrated');
    assert.equal(
      FunctionParameter.valueSourceType,
      Payload.valueSourceType,
      'valueSourceType property was properly hydrated'
    );

    assert.strictEqual(
      FunctionParameter['_localValues'],
      Payload._localValues,
      '_localValues property was properly hydrated'
    );

    assert.equal(FunctionParameter.defaultValue, Payload.defaultValue, 'defaultValue property was properly hydrated');
  });

  test('ValueSourceType=enum values', async function (assert) {
    const enumValues = await FunctionParameter.values;
    assert.deepEqual(enumValues, Payload._localValues, 'enum value source type returns the local values');
  });

  test('ValueSourceType=table values', async function (assert) {
    const mockDimMeta = {};
    const mockDimensionService = {
      all: (dimensionColumn: DimensionColumn) => {
        assert.strictEqual(dimensionColumn.columnMetadata, mockDimMeta, 'mock dimension meta is passed in');
        return Promise.resolve(
          new NaviDimensionResponse(nullInjector, {
            values: [
              new NaviDimensionModel(nullInjector, { dimensionColumn, value: 1, suggestions: { desc: 'ABC' } }),
              new NaviDimensionModel(nullInjector, { dimensionColumn, value: 2, suggestions: { desc: 'DEF' } }),
              new NaviDimensionModel(nullInjector, { dimensionColumn, value: 3, suggestions: { desc: 'GHI' } }),
            ],
          })
        );
      },
    } as DimensionService;
    const mockMetadataService: Partial<MetadataService> = {
      findById<K extends keyof MetadataModelRegistry>(
        _type: K,
        id: string,
        _dataSourceName: string
      ): Promise<MetadataModelRegistry[K] | undefined> {
        assert.strictEqual(id, 'alphabet', 'dimension is looked up');
        //@ts-expect-error
        return Promise.resolve(mockDimMeta);
      },
    };
    const tableLookupParam = new FunctionParameterMetadataModel(
      {
        lookup: (_type, service) => {
          const services: Partial<Record<ClientServices, unknown>> = {
            'navi-dimension': mockDimensionService,
            'navi-metadata': mockMetadataService,
          };
          return services[service];
        },
      },
      {
        ...Payload,
        valueSourceType: ValueSourceType.TABLE,
        tableSource: {
          valueSource: 'alphabet',
        },
      }
    );
    const tableValues = await tableLookupParam.values;
    assert.deepEqual(
      tableValues,
      [
        { description: '1 (ABC)', id: '1', name: '1' },
        { description: '2 (DEF)', id: '2', name: '2' },
        { description: '3 (GHI)', id: '3', name: '3' },
      ],
      'table value source type returns table values'
    );
  });

  test('ValueSourceType=none values', async function (assert) {
    FunctionParameter.valueSourceType = ValueSourceType.NONE;
    const noneValues = await FunctionParameter.values;
    assert.deepEqual(noneValues, [], 'none value source type returns an empty array');

    //Test NONE + boolean Value
    FunctionParameter.valueSourceType = ValueSourceType.NONE;
    FunctionParameter.valueType = DataType.BOOLEAN;
    const booleanValues = await FunctionParameter.values;
    assert.deepEqual(
      booleanValues,
      [
        { id: true, name: 'True' },
        { id: false, name: 'False' },
      ],
      'none value source type of type boolean returns boolean values'
    );
  });
});
