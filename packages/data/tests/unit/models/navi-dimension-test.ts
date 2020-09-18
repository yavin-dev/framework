import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { DimensionColumn } from 'navi-data/adapters/dimensions/interface';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import ElideOneScenario from 'navi-data/mirage/scenarios/elide-one';
import { Server } from 'miragejs';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  server: Server;
}

module('Unit | Model | navi dimension', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function(this: TestContext) {
    this.metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    ElideOneScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });
  });

  test('it exists', function(this: TestContext, assert) {
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'table0.dimension0',
      'elideOne'
    ) as DimensionMetadataModel;
    const dimensionColumn: DimensionColumn = { columnMetadata };
    const value = 'link';
    const model = NaviDimensionModel.create({ dimensionColumn, value });

    assert.equal(model.value, value, '`NaviDimensionModel` has a `value` field');
    assert.equal(
      model.displayValue,
      `${value}`,
      '`NaviDimensionModel` has a `displayValue` field which is a stringified version of `value`'
    );
  });

  test('isEqual', function(this: TestContext, assert) {
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'table0.dimension0',
      'elideOne'
    ) as DimensionMetadataModel;
    const parameters = { heroOf: 'time' };
    const value = 'link';
    const dimensionColumn: DimensionColumn = { columnMetadata, parameters };

    const model1 = NaviDimensionModel.create({ dimensionColumn, value });
    assert.ok(model1.isEqual(model1), '`isEqual` returns true for the same object reference');

    const model2 = NaviDimensionModel.create({ dimensionColumn: { columnMetadata, parameters }, value });
    assert.ok(
      model1.isEqual(model2),
      '`isEqual` returns true for models that have the same DimensionColumn values and dimension value'
    );

    const model3 = NaviDimensionModel.create({ dimensionColumn, value: 'zelda' });
    assert.notOk(
      model1.isEqual(model3),
      '`isEqual` returns false for models that do not that have the same dimension value'
    );

    const otherColumnMetadata = this.metadataService.getById(
      'dimension',
      'table0.dimension1',
      'elideOne'
    ) as DimensionMetadataModel;
    const model4 = NaviDimensionModel.create({
      dimensionColumn: {
        columnMetadata: otherColumnMetadata,
        parameters
      } as DimensionColumn,
      value
    });
    assert.notOk(
      model1.isEqual(model4),
      '`isEqual` returns false for models that do not that have the same column metadata object'
    );

    const model5 = NaviDimensionModel.create({
      dimensionColumn: {
        columnMetadata: otherColumnMetadata,
        parameters: { heroOf: 'twilight' }
      } as DimensionColumn,
      value
    });
    assert.notOk(
      model1.isEqual(model5),
      '`isEqual` returns false for models that do not that have the same column parameters'
    );
  });
});
