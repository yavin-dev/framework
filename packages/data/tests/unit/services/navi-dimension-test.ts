import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviDimensionAdapter, { DimensionColumn, DimensionFilter } from 'navi-data/adapters/dimensions/interface';
import { TestContext as Context } from 'ember-test-helpers';
import NaviDimensionSerializer from 'navi-data/serializers/dimensions/interface';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import NaviDimensionService, { ServiceOptions } from 'navi-data/services/navi-dimension';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import EmberObject from '@ember/object';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import GraphQLScenario from 'dummy/mirage/scenarios/elide-one';
import { Server } from 'miragejs';

const dimensions: Record<string, unknown[]> = {
  dimension1: [1, 2, 3, 4, 5],
  dimension2: ['foo', 'bar', 'foo-bar']
};

class TestAdapter extends EmberObject implements NaviDimensionAdapter {
  async all(dimension: DimensionColumn, _options?: ServiceOptions): Promise<unknown[]> {
    return dimensions[dimension.columnMetadata.id];
  }

  async find(dimension: DimensionColumn, predicate: DimensionFilter[], _options?: ServiceOptions): Promise<unknown[]> {
    const all = await this.all(dimension);
    return all.filter(d => predicate[0].values.includes(d));
  }

  async search(dimension: DimensionColumn, query: string, _options?: ServiceOptions): Promise<unknown[]> {
    const all = await this.all(dimension);
    return all.filter(d => `${d}`.includes(query));
  }
}

class TestSerialier extends EmberObject implements NaviDimensionSerializer {
  normalize(dimensionColumn: DimensionColumn, rawPayload: unknown[]): NaviDimensionModel[] {
    return rawPayload.map(value => NaviDimensionModel.create({ value, dimensionColumn }));
  }
}

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  server: Server;
}

module('Unit | Service | navi-dimension', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    this.owner.register('adapter:dimensions/elide', TestAdapter);
    this.owner.register('serializer:dimensions/elide', TestSerialier);
    this.metadataService = this.owner.lookup('service:navi-metadata');
    GraphQLScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });
  });

  test('all', async function(this: TestContext, assert) {
    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'dimension1',
      'elideOne'
    ) as DimensionMetadataModel;
    const all = await service.all({ columnMetadata });
    assert.deepEqual(
      all.map(({ value }) => value),
      dimensions.dimension1,
      '`all` calls the correct adapter, serializer, and methods'
    );
  });

  test('find', async function(this: TestContext, assert) {
    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'dimension1',
      'elideOne'
    ) as DimensionMetadataModel;
    const filters: DimensionFilter[] = [{ operator: 'in', values: [1, 2] }];
    const all = await service.find({ columnMetadata }, filters);
    assert.deepEqual(
      all.map(({ value }) => value),
      [1, 2],
      '`find` calls the correct adapter, serializer, and methods'
    );
  });

  test('search', async function(this: TestContext, assert) {
    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'dimension2',
      'elideOne'
    ) as DimensionMetadataModel;
    const all = await service.search({ columnMetadata }, 'foo');
    assert.deepEqual(
      all.map(({ value }) => value),
      ['foo', 'foo-bar'],
      '`search` calls the correct adapter, serializer, and methods'
    );
  });
});
