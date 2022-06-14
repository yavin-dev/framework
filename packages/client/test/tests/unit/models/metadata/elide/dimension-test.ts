import { module, test } from 'qunit';
import ElideDimensionMetadataModel, {
  ElideDimensionMetadataPayload,
  ValueSourceType,
} from '@yavin/client/models/metadata/elide/dimension';
import { nullInjector } from '../../../../helpers/injector';
import type { Injector } from '@yavin/client/models/native-with-create';

let PayloadBase: ElideDimensionMetadataPayload;

module('Unit | Model | metadata/elide/dimension', function (hooks) {
  hooks.beforeEach(function () {
    PayloadBase = {
      id: 'dim',
      name: 'Dimension',
      source: 'elideOne',
      valueType: 'text',
      isSortable: false,
      type: 'formula',
      tableSource: undefined,
      valueSourceType: ValueSourceType.ENUM,
      cardinality: undefined,
      values: [],
    };
  });

  test('it properly hydrates properties', function (assert) {
    const Model = new ElideDimensionMetadataModel(nullInjector, PayloadBase);
    assert.deepEqual(Model.valueSourceType, 'ENUM', 'valueSourceType property is hydrated properly');
    assert.deepEqual(Model.hasEnumValues, true, 'hasEnumValues property is hydrated properly');
    assert.deepEqual(Model.values, [], 'values property is hydrated properly');
    assert.deepEqual(Model.cardinality, 'SMALL', 'cardinality property defaults to small if enum values are used');
    assert.deepEqual(Model.tableSource, undefined, 'tableSource property is hydrated properly');
    assert.deepEqual(Model.valueSource, Model, 'valueSource property is hydrated properly');

    const ModelWithCardinality = new ElideDimensionMetadataModel(nullInjector, {
      ...PayloadBase,
      cardinality: 'MEDIUM',
    });
    assert.deepEqual(ModelWithCardinality.cardinality, 'MEDIUM', 'cardinality property is not overridden if provided');
  });

  test('it looks up tableSource', function (assert) {
    assert.expect(6);

    const injector: Injector = {
      //@ts-expect-error - mock injector
      lookup(type, name) {
        assert.equal(type, 'service', 'service is looked up');
        assert.equal(name, 'navi-metadata', 'metadata service is looked up');
        return {
          getById(type, id, dataSourceName) {
            assert.deepEqual(type, 'dimension', 'Looks up column as dimension');
            assert.deepEqual(id, Model.tableSource?.valueSource, 'Looks up column using table source');
            assert.deepEqual(dataSourceName, Model.source, 'Looks up column using current datasource');
            return fakeLookup;
          },
        };
      },
    };

    const Model = new ElideDimensionMetadataModel(injector, {
      ...PayloadBase,
      valueSourceType: ValueSourceType.TABLE,
      tableSource: {
        valueSource: 'tableName.field',
        suggestionColumns: [],
      },
    });
    const fakeLookup = { fake: true } as unknown as ElideDimensionMetadataModel;

    assert.deepEqual(Model.valueSource, fakeLookup, 'The lookup column returns the linked dimension');
  });
});
