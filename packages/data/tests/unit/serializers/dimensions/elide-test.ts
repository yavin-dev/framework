import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { capitalize } from '@ember/string';
import GraphQLScenario from 'navi-data/mirage/scenarios/elide-two';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { QueryStatus, AsyncQueryResponse } from '@yavin/client/adapters/facts/interface';
import ElideDimensionMetadataModel from '@yavin/client/models/metadata/elide/dimension';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type DimensionMetadataModel from '@yavin/client/models/metadata/dimension';
import NaviDimensionModel from '@yavin/client/models/navi-dimension';
import type { TestContext as Context } from 'ember-test-helpers';
import type { Server } from 'miragejs';
import type ElideDimensionSerializer from 'navi-data/serializers/dimensions/elide';
import type { FetchResult } from '@apollo/client/core';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  server: Server;
}

module('Unit | Serializer | Dimensions | Elide', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.metadataService = this.owner.lookup('service:navi-metadata');
    GraphQLScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });
  });

  test('normalize', function (this: TestContext, assert) {
    const serializer: ElideDimensionSerializer = this.owner.lookup('serializer:dimensions/elide');
    const payload: FetchResult<AsyncQueryResponse> = {
      data: {
        asyncQuery: {
          edges: [
            {
              node: {
                id: 'c7d2fe70-b63f-11ea-b45b-bf754c72eca6',
                query: '"{ "query": "{ tableA { edges { node { col0:dimension1 } } } } " }',
                status: QueryStatus.COMPLETE,
                result: {
                  contentLength: 129,
                  httpStatus: 200,
                  recordCount: 3,
                  responseBody: JSON.stringify({
                    data: {
                      table0: {
                        edges: [{ node: { col0: 'foo' } }, { node: { col0: 'bar' } }, { node: { col0: 'baz' } }],
                        pageInfo: {
                          startCursor: '0',
                          endCursor: '3',
                          totalRecords: 6,
                        },
                      },
                    },
                  }),
                },
              },
            },
          ],
        },
      },
    };
    const dimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension1',
        'elideOne'
      ) as DimensionMetadataModel,
    };
    assert.deepEqual(
      serializer.normalize(dimensionColumn).values,
      [],
      'Empty array is returned for an undefined payload'
    );

    const expectedModels = ['foo', 'bar', 'baz'].map(
      (value) =>
        new NaviDimensionModel(this.owner.lookup('service:client-injector'), {
          value,
          dimensionColumn,
          suggestions: {},
        })
    );
    const dimensionResponse = serializer.normalize(dimensionColumn, payload);
    assert.deepEqual(
      dimensionResponse.values,
      expectedModels,
      'normalize returns the dimension values of the raw payload'
    );
    assert.deepEqual(
      dimensionResponse.meta,
      {
        pagination: {
          currentPage: 1,
          numberOfResults: 6,
          rowsPerPage: 3,
        },
      },
      'normalize creates a `meta` prop for pagination'
    );
  });

  test('normalize - tableSource', function (this: TestContext, assert) {
    const factTable = 'table1';
    const factField = 'dimension2';
    const lookupTable = 'table0';
    const lookupField = 'dimension0';

    const serializer: ElideDimensionSerializer = this.owner.lookup('serializer:dimensions/elide');
    const payload: FetchResult<AsyncQueryResponse> = {
      data: {
        asyncQuery: {
          edges: [
            {
              node: {
                id: 'c7d2fe70-b63f-11ea-b45b-bf754c72eca6',
                query: `"{ "query": "{ ${lookupTable} { edges { node { col0:${lookupField} } } } } " }`,
                status: QueryStatus.COMPLETE,
                result: {
                  contentLength: 129,
                  httpStatus: 200,
                  recordCount: 3,
                  responseBody: JSON.stringify({
                    data: {
                      [lookupTable]: {
                        edges: [
                          { node: { col0: 'foo', col1: 'Foo' } },
                          { node: { col0: 'bar', col1: 'Bar' } },
                          { node: { col0: 'baz', col1: 'Baz' } },
                        ],
                        pageInfo: {
                          startCursor: '0',
                          endCursor: '3',
                          totalRecords: 6,
                        },
                      },
                    },
                  }),
                },
              },
            },
          ],
        },
      },
    };
    const baseDim = this.metadataService.getById(
      'dimension',
      `${factTable}.${factField}`,
      'elideOne'
    ) as ElideDimensionMetadataModel;
    const dimensionColumn: DimensionColumn = {
      columnMetadata: new ElideDimensionMetadataModel(this.owner.lookup('service:client-injector'), {
        ...baseDim,
        tableSource: {
          valueSource: baseDim.tableSource?.valueSource,
          suggestionColumns: [{ id: 'dimension3' }],
        },
      }),
    };
    const expectedModels = ['foo', 'bar', 'baz'].map(
      (value) =>
        new NaviDimensionModel(this.owner.lookup('service:client-injector'), {
          value,
          dimensionColumn,
          suggestions: { dimension3: capitalize(value) },
        })
    );
    const dimensionResponse = serializer.normalize(dimensionColumn, payload);
    assert.deepEqual(
      dimensionResponse.values,
      expectedModels,
      '`tableSource`, when available, is used to normalize dimension value responses'
    );
    assert.deepEqual(
      dimensionResponse.meta,
      {
        pagination: {
          currentPage: 1,
          numberOfResults: 6,
          rowsPerPage: 3,
        },
      },
      'normalize creates a `meta` prop for pagination'
    );
  });
});
