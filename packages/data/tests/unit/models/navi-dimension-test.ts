import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { DimensionColumn } from 'navi-data/adapters/dimensions/interface';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
}

module('Unit | Model | navi dimension', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function(this: TestContext) {
    this.metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });
  });

  test('it exists', function(this: TestContext, assert) {
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'dimension0',
      'elideOne'
    ) as DimensionMetadataModel;
    const dimensionColumn: DimensionColumn = { columnMetadata };
    const value = 123;
    const model = NaviDimensionModel.create({ dimensionColumn, value });

    assert.equal(model.value, value, '`NaviDimensionModel` has a `value` field');
    assert.equal(
      model.displayValue,
      `${value}`,
      '`NaviDimensionModel` has a `displayValue` field which is a stringified version of `value`'
    );
  });
});
