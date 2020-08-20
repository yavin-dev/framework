import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { QueryStatus, AsyncQueryResponse, QueryResultType } from 'navi-data/adapters/facts/interface';
import { DimensionColumn } from 'navi-data/adapters/dimensions/interface';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import { TestContext as Context } from 'ember-test-helpers';
import GraphQLScenario from 'dummy/mirage/scenarios/elide-one';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Server } from 'miragejs';

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
    assert.expect(2);
    const serializer = this.owner.lookup('serializer:dimensions/elide');

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
                resultType: QueryResultType.EMBEDDED,
                responseBody:
                  '{"data":{"table0":{"edges":[{"node":{"dimension1":"foo"}},{"node":{"dimension1":"bar"}},{"node":{"dimension1":"baz"}}]}}}'
              }
            }
          }
        ]
      }
    };
    const dimColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension1',
        'elideOne'
      ) as DimensionMetadataModel,
      parameters: {
        baddabing: 'baddaboom'
      }
    };
    assert.deepEqual(serializer.normalize(dimColumn), [], 'Empty array is returned for an undefined payload');

    const expectedModels = ['foo', 'bar', 'baz'].map(dimVal =>
      NaviDimensionModel.create({ value: dimVal, dimensionColumn: dimColumn })
    );
    assert.deepEqual(
      serializer.normalize(dimColumn, payload),
      expectedModels,
      'normalize returns the `rows` prop of the raw payload'
    );
  });
});
