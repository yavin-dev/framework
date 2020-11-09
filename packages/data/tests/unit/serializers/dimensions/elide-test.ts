import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { QueryStatus, AsyncQueryResponse } from 'navi-data/adapters/facts/interface';
import { DimensionColumn } from 'navi-data/models/metadata/dimension';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import { TestContext as Context } from 'ember-test-helpers';
import GraphQLScenario from 'navi-data/mirage/scenarios/elide-two';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Server } from 'miragejs';
import ElideDimensionSerializer from 'navi-data/serializers/dimensions/elide';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  server: Server;
}

module('Unit | Serializer | Dimensions | Elide', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    this.metadataService = this.owner.lookup('service:navi-metadata');
    GraphQLScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });
  });

  test('normalize', function(this: TestContext, assert) {
    const serializer: ElideDimensionSerializer = this.owner.lookup('serializer:dimensions/elide');
    const payload: AsyncQueryResponse = {
      asyncQuery: {
        edges: [
          {
            node: {
              id: 'c7d2fe70-b63f-11ea-b45b-bf754c72eca6',
              query: '"{ "query": "{ tableA { edges { node { dimension1 } } } } " }',
              status: QueryStatus.COMPLETE,
              result: {
                contentLength: 129,
                httpStatus: 200,
                recordCount: 3,
                responseBody:
                  '{"data":{"table0":{"edges":[{"node":{"dimension1":"foo"}},{"node":{"dimension1":"bar"}},{"node":{"dimension1":"baz"}}]}}}'
              }
            }
          }
        ]
      }
    };
    const dimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension1',
        'elideOne'
      ) as DimensionMetadataModel
    };
    assert.deepEqual(serializer.normalize(dimensionColumn), [], 'Empty array is returned for an undefined payload');

    const expectedModels = ['foo', 'bar', 'baz'].map(value => NaviDimensionModel.create({ value, dimensionColumn }));
    const actualModels = serializer.normalize(dimensionColumn, payload);
    assert.deepEqual(actualModels, expectedModels, 'normalize returns the `rows` prop of the raw payload');
  });

  test('normalize - tableSource', function(this: TestContext, assert) {
    const factTable = 'table1';
    const factField = 'dimension2';
    const lookupTable = 'table0';
    const lookupField = 'dimension0';

    const serializer: ElideDimensionSerializer = this.owner.lookup('serializer:dimensions/elide');
    const payload: AsyncQueryResponse = {
      asyncQuery: {
        edges: [
          {
            node: {
              id: 'c7d2fe70-b63f-11ea-b45b-bf754c72eca6',
              query: `"{ "query": "{ ${lookupTable} { edges { node { ${lookupField} } } } } " }`,
              status: QueryStatus.COMPLETE,
              result: {
                contentLength: 129,
                httpStatus: 200,
                recordCount: 3,
                responseBody: `{"data":{"${lookupTable}":{"edges":[{"node":{"${lookupField}":"foo"}},{"node":{"${lookupField}":"bar"}},{"node":{"${lookupField}":"baz"}}]}}}`
              }
            }
          }
        ]
      }
    };
    const dimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        `${factTable}.${factField}`,
        'elideOne'
      ) as DimensionMetadataModel
    };
    const expectedModels = ['foo', 'bar', 'baz'].map(value => NaviDimensionModel.create({ value, dimensionColumn }));
    const actualModels = serializer.normalize(dimensionColumn, payload);
    assert.deepEqual(actualModels, expectedModels, '`tableSource`, when available, is used to normalize dimension value responses');
  });
});
