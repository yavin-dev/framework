import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext as Context } from 'ember-test-helpers';
import BardDimensionSerializer from 'navi-data/serializers/dimensions/bard';
import NaviMetadataService from 'navi-data/services/navi-metadata';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { FiliDimensionResponse } from 'navi-data/adapters/dimensions/bard';
import DimensionMetadataModel, { DimensionColumn } from 'navi-data/models/metadata/dimension';
import ContainerDimValues from 'navi-data/mirage/bard-lite/dimensions/container';
import { cloneDeep } from 'lodash-es';

interface TestContext extends Context {
  serializer: BardDimensionSerializer;
  metadataService: NaviMetadataService;
}

module('Unit | Serializer | Dimensions | Bard', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.serializer = this.owner.lookup('serializer:dimensions/bard');
    this.metadataService = this.owner.lookup('service:navi-metadata');
    await this.metadataService.loadMetadata({ dataSourceName: 'bardTwo' });
  });

  test('normalize', function (this: TestContext, assert) {
    const payload: FiliDimensionResponse = {
      rows: cloneDeep(ContainerDimValues),
    };

    const dimColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel,
      parameters: {
        field: 'id',
      },
    };

    const normalized = this.serializer.normalize(dimColumn, payload);
    assert.deepEqual(
      normalized.values.map(({ value }) => value),
      ContainerDimValues.map(({ id }) => id),
      '`normalize` hydrated NaviDimensionModel objects with the correct field value'
    );

    assert.deepEqual(
      normalized.values.map(({ displayValue }) => displayValue),
      ContainerDimValues.map(({ id }) => id),
      '`normalize` hydrated NaviDimensionModel and produced the correct `displayValue`'
    );
  });

  test('normalize - desc field', function (this: TestContext, assert) {
    const payload: FiliDimensionResponse = {
      rows: cloneDeep(ContainerDimValues),
    };

    const dimColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel,
      parameters: {
        field: 'desc',
      },
    };

    const normalized = this.serializer.normalize(dimColumn, payload);

    assert.deepEqual(
      normalized.values.map(({ value }) => value),
      ContainerDimValues.map(({ description }) => description),
      '`normalize` uses the `description` property when `desc` field is requested'
    );

    assert.deepEqual(
      normalized.values.map(({ displayValue }) => displayValue),
      ContainerDimValues.map(({ description }) => description),
      '`normalize` hydrated NaviDimensionModel and produced the correct `displayValue`'
    );
  });

  test('normalize - empty', function (this: TestContext, assert) {
    const payload: FiliDimensionResponse = { rows: [] };

    const dimColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel,
      parameters: {
        field: 'description',
      },
    };
    assert.deepEqual(
      this.serializer.normalize(dimColumn, payload).values,
      [],
      '`normalize` can handle an empty payload'
    );
  });

  test('normalize suggestions - only uses non selected fields as suggestions', function (this: TestContext, assert) {
    const payload: FiliDimensionResponse = {
      rows: cloneDeep(ContainerDimValues).map((r: Record<string, string>, idx) => {
        r.key = `key${idx}`;
        return r;
      }),
    };

    const container = this.metadataService.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel;
    const noSuggestions = new DimensionMetadataModel(this.owner, {
      ...container,
      tableSource: { suggestionColumns: [] },
    });
    const noSuggestionsColumn: DimensionColumn = { columnMetadata: noSuggestions, parameters: { field: 'desc' } };
    assert.deepEqual(
      this.serializer.normalize(noSuggestionsColumn, payload).values.map((v) => v.suggestions),
      [{}, {}, {}, {}],
      '`normalize` dimension with no suggestion columns gives empty array'
    );

    const withSuggestions = new DimensionMetadataModel(this.owner, {
      ...container,
      tableSource: {
        suggestionColumns: [
          { id: 'container', parameters: { field: 'id' } },
          { id: 'container', parameters: { field: 'desc' } },
        ],
      },
    });

    const descColumn: DimensionColumn = { columnMetadata: withSuggestions, parameters: { field: 'key' } };
    assert.deepEqual(
      this.serializer.normalize(descColumn, payload).values.map((v) => v.suggestions),
      [
        { id: '1', description: 'Bag' },
        { id: '2', description: 'Bank' },
        { id: '3', description: 'Saddle Bag' },
        { id: '4', description: 'Retainer' },
      ],
      '`normalize` uses the suggestion columns that were not selected as suggestions'
    );

    const idColumn: DimensionColumn = { columnMetadata: withSuggestions, parameters: { field: 'id' } };
    assert.deepEqual(
      this.serializer.normalize(idColumn, payload).values.map((v) => v.suggestions),
      [{ description: 'Bag' }, { description: 'Bank' }, { description: 'Saddle Bag' }, { description: 'Retainer' }],
      '`normalize` uses the suggestion columns that were not selected as suggestions'
    );
  });

  test('normalize suggestions - only same dimension with different fields', function (this: TestContext, assert) {
    const payload: FiliDimensionResponse = { rows: cloneDeep(ContainerDimValues) };

    const container = this.metadataService.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel;
    const columnMetadata = new DimensionMetadataModel(this.owner, {
      ...container,
      tableSource: {
        suggestionColumns: [
          { id: 'container', parameters: { field: 'id' } },
          { id: 'container', parameters: { field: 'desc' } },
        ],
      },
    });
    const dimColumn: DimensionColumn = { columnMetadata, parameters: { field: 'desc' } };

    columnMetadata.tableSource!.suggestionColumns = [{ id: 'otherDim', parameters: { field: 'id' } }];
    assert.throws(
      () => {
        this.serializer.normalize(dimColumn, payload);
      },
      /Error: Only different fields of the same dimension may be used as suggestions/,
      '`normalize` throws an error if a different dimension is used as a suggestion'
    );

    columnMetadata.tableSource!.suggestionColumns = [{ id: 'container', parameters: { notField: 'id' } }];
    assert.throws(
      () => {
        this.serializer.normalize(dimColumn, payload);
      },
      /Error: Only different fields of the same dimension may be used as suggestions/,
      '`normalize` throws an error if no field is specified for the suggestion'
    );
  });
});
