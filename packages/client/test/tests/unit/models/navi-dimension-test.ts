import { module, test } from 'qunit';
import NaviDimensionModel from '@yavin/client/models/navi-dimension';
import DimensionMetadataModel, { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import { nullInjector } from '../../helpers/injector';

const dim0 = new DimensionMetadataModel(
  nullInjector,
  //@ts-ignore - partial dim
  {
    id: 'dim0',
    name: 'Dimension 0',
    source: 'mock',
  }
);
const dim1 = new DimensionMetadataModel(
  nullInjector,
  //@ts-ignore - partial dim
  {
    id: 'dim1',
    name: 'Dimension 1',
    source: 'mock',
  }
);

module('Unit | Model | navi dimension', function () {
  test('it exists', function (assert) {
    const dimensionColumn: DimensionColumn = { columnMetadata: dim0 };
    const value = 'link';
    const model = new NaviDimensionModel(nullInjector, { dimensionColumn, value });

    assert.equal(model.value, value, '`NaviDimensionModel` has a `value` field');
    assert.equal(
      model.displayValue,
      `${value}`,
      '`NaviDimensionModel` has a `displayValue` field which is a stringified version of `value`'
    );
  });

  test('it shows suggestions', function (assert) {
    const dimensionColumn: DimensionColumn = { columnMetadata: dim0 };
    const value = 'link';
    const model = new NaviDimensionModel(nullInjector, {
      dimensionColumn,
      value,
      suggestions: {},
    });

    assert.equal(
      model.displayValue,
      `${value}`,
      '`NaviDimensionModel` has a `displayValue` field which is a stringified version of `value`'
    );
  });

  test('isEqual', function (assert) {
    const parameters = { heroOf: 'time' };
    const value = 'link';
    const dimensionColumn: DimensionColumn = { columnMetadata: dim0, parameters };

    const model1 = new NaviDimensionModel(nullInjector, { dimensionColumn, value });
    assert.ok(model1.isEqual(model1), '`isEqual` returns true for the same object reference');

    const model2 = new NaviDimensionModel(nullInjector, {
      dimensionColumn,
      value,
    });
    assert.ok(
      model1.isEqual(model2),
      '`isEqual` returns true for models that have the same DimensionColumn values and dimension value'
    );

    const model2WithSuggestions = new NaviDimensionModel(nullInjector, {
      dimensionColumn,
      value,
      suggestions: { col1: 'Ignore me' },
    });
    assert.ok(
      model2.isEqual(model2WithSuggestions),
      '`isEqual` returns true for models that have the same DimensionColumn values and dimension value but different suggestions'
    );

    const model3 = new NaviDimensionModel(nullInjector, {
      dimensionColumn,
      value: 'zelda',
    });
    assert.notOk(
      model1.isEqual(model3),
      '`isEqual` returns false for models that do not that have the same dimension value'
    );

    const model4 = new NaviDimensionModel(nullInjector, {
      dimensionColumn: {
        columnMetadata: dim1,
        parameters,
      } as DimensionColumn,
      value,
    });
    assert.notOk(
      model1.isEqual(model4),
      '`isEqual` returns false for models that do not that have the same column metadata object'
    );

    const model5 = new NaviDimensionModel(nullInjector, {
      dimensionColumn: {
        columnMetadata: dim1,
        parameters: { heroOf: 'twilight' },
      } as DimensionColumn,
      value,
    });
    assert.notOk(
      model1.isEqual(model5),
      '`isEqual` returns false for models that do not that have the same column parameters'
    );
  });
});
