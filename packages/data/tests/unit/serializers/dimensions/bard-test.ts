import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext as Context } from 'ember-test-helpers';
import BardDimensionSerializer from 'navi-data/serializers/dimensions/bard';
import NaviMetadataService from 'navi-data/services/navi-metadata';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { FiliDimensionResponse } from 'navi-data/adapters/dimensions/bard';
import { DimensionColumn } from 'navi-data/adapters/dimensions/interface';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import ContainerDimValues from 'navi-data/mirage/bard-lite/dimensions/container';
import { cloneDeep } from 'lodash-es';

interface TestContext extends Context {
  serializer: BardDimensionSerializer;
  metadataService: NaviMetadataService;
}

module('Unit | Serializer | Dimensions | Bard', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    this.serializer = this.owner.lookup('serializer:dimensions/bard');
    this.metadataService = this.owner.lookup('service:navi-metadata');
    await this.metadataService.loadMetadata({ dataSourceName: 'bardTwo' });
  });

  test('normalize', function(this: TestContext, assert) {
    const payload: FiliDimensionResponse = {
      rows: cloneDeep(ContainerDimValues)
    };

    const dimColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel,
      parameters: {
        field: 'id'
      }
    };

    const normalized = this.serializer.normalize(dimColumn, payload);
    assert.deepEqual(
      normalized.map(({ value }) => value),
      ContainerDimValues.map(({ id }) => id),
      '`normalize` hydrated NaviDimensionModel objects with the correct field value'
    );
    assert.deepEqual(
      normalized.map(({ displayValue }) => displayValue),
      ContainerDimValues.map(({ id }) => id),
      '`normalize` hydrated NaviDimensionModel and produced the correct `displayValue`'
    );
  });

  test('normalize - desc field', function(this: TestContext, assert) {
    const payload: FiliDimensionResponse = {
      rows: cloneDeep(ContainerDimValues)
    };

    const dimColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel,
      parameters: {
        field: 'desc'
      }
    };

    const normalized = this.serializer.normalize(dimColumn, payload);

    assert.deepEqual(
      normalized.map(({ value }) => value),
      ContainerDimValues.map(({ description }) => description),
      '`normalize` uses the `description` property when `desc` field is requested'
    );

    assert.deepEqual(
      normalized.map(({ displayValue }) => displayValue),
      ContainerDimValues.map(({ description }) => description),
      '`normalize` hydrated NaviDimensionModel and produced the correct `displayValue`'
    );
  });

  test('normalize - empty', function(this: TestContext, assert) {
    const payload: FiliDimensionResponse = { rows: [] };

    const dimColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel,
      parameters: {
        field: 'description'
      }
    };
    assert.deepEqual(this.serializer.normalize(dimColumn, payload), [], '`normalize` can handle an empty payload');
  });
});
