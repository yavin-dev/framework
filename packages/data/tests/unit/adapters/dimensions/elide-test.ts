import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ElideDimensionAdapter from 'navi-data/adapters/dimensions/elide';
import { RequestV2, AsyncQueryResponse, QueryStatus, RequestOptions } from 'navi-data/adapters/facts/interface';
import DimensionMetadataModel, { DimensionColumn } from 'navi-data/models/metadata/dimension';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { TestContext as Context } from 'ember-test-helpers';
import ElideOneScenario from 'navi-data/mirage/scenarios/elide-one';
import ElideTwoScenario from 'navi-data/mirage/scenarios/elide-two';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Server } from 'miragejs';
import { getElideField } from 'navi-data/adapters/facts/elide';
import { ResponseEdge } from 'navi-data/serializers/dimensions/elide';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  server: Server;
}

function assertRequest(context: TestContext, callback: (request: RequestV2, options?: RequestOptions) => void) {
  const fakeResponse: AsyncQueryResponse = {
    asyncQuery: { edges: [{ node: { id: '1', query: 'foo', status: QueryStatus.COMPLETE, result: null } }] }
  };
  const originalFactAdapter = context.owner.factoryFor('adapter:facts/elide').class;
  class TestAdapter extends originalFactAdapter {
    fetchDataForRequest(request: RequestV2, options?: RequestOptions) {
      callback(request, options);
      return Promise.resolve(fakeResponse);
    }
  }
  context.owner.unregister('adapter:facts/elide');
  context.owner.register('adapter:facts/elide', TestAdapter);
}

function extractDimValues(dimension: DimensionColumn, rawResponse: AsyncQueryResponse): string[] {
  const responseStr = rawResponse?.asyncQuery.edges[0].node.result?.responseBody || '';
  const response = JSON.parse(responseStr);
  const { id: dimensionName, tableId } = dimension.columnMetadata;
  return response.data[tableId as string].edges.map((edge: ResponseEdge) => edge.node[getElideField(dimensionName)]);
}

module('Unit | Adapter | Dimensions | Elide', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    this.metadataService = this.owner.lookup('service:navi-metadata');
    ElideOneScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });

    //reset the db so we can set the db up for the elideTwo scenario
    this.server.db.emptyData();
    //reset the indexes used by the mirage factories
    //@ts-ignore
    this.server.factorySequences = {};
    ElideTwoScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideTwo' });
  });

  test('find', async function(this: TestContext, assert) {
    assert.expect(2);

    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension0',
        'elideTwo'
      ) as DimensionMetadataModel,
      parameters: {
        foo: 'bar'
      }
    };

    const expectedRequest: RequestV2 = {
      columns: [{ field: 'table0.dimension0', parameters: { foo: 'bar' }, type: 'dimension' }],
      filters: [
        {
          field: 'table0.dimension0',
          parameters: { foo: 'bar' },
          type: 'dimension',
          operator: 'in',
          values: ['v1', 'v2']
        }
      ],
      sorts: [],
      table: 'table0',
      limit: null,
      dataSource: 'elideTwo',
      requestVersion: '2.0'
    };
    const expectedOptions = {
      timeout: 30000,
      page: 6,
      perPage: 24
    };

    assertRequest(this, (request, options) => {
      assert.deepEqual(request, expectedRequest, 'Correct request is sent to elide fact adapter for find');
      assert.deepEqual(options, expectedOptions, 'Options are passed through to the fact adapter');
    });

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');
    await adapter.find(TestDimensionColumn, [{ operator: 'in', values: ['v1', 'v2'] }], expectedOptions);
  });

  test('find - enum', async function(this: TestContext, assert) {
    assert.expect(5);

    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension1',
        'elideOne'
      ) as DimensionMetadataModel
    };

    assertRequest(this, (_request, _options) => {
      assert.notOk(true, 'Elide dimensions with enum values should not make network requests');
    });

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');

    const emptyInResponse = await adapter.find(TestDimensionColumn, [{ operator: 'in', values: ['v1', 'v2'] }]);
    assert.deepEqual(
      extractDimValues(TestDimensionColumn, emptyInResponse),
      [],
      '`find` can return empty results for enum dimension values when no match is found'
    );

    const inValues = ['Practical Frozen Fish (enum)', 'Practical Concrete Chair (enum)'];
    const inResponse = await adapter.find(TestDimensionColumn, [{ operator: 'in', values: inValues }]);
    assert.deepEqual(
      extractDimValues(TestDimensionColumn, inResponse),
      inValues,
      '`find` with `in` operator returns filtered enum values for dimensions that provide them'
    );

    const eqValues = ['Practical Frozen Fish (enum)'];
    const eqResponse = await adapter.find(TestDimensionColumn, [{ operator: 'eq', values: eqValues }]);
    assert.deepEqual(
      extractDimValues(TestDimensionColumn, eqResponse),
      eqValues,
      '`find` with `eq` operator returns filtered enum value for dimensions that provide them'
    );

    const filtersResponse = await adapter.find(TestDimensionColumn, [
      { operator: 'in', values: inValues },
      { operator: 'eq', values: eqValues }
    ]);

    assert.deepEqual(
      extractDimValues(TestDimensionColumn, filtersResponse),
      eqValues,
      '`find` supports multiple predicates when filtering enum values'
    );

    try {
      await adapter.find(TestDimensionColumn, [{ operator: 'gt', values: eqValues }]);
    } catch (e) {
      assert.equal(
        e.message,
        'Assertion Failed: Dimension enum filter operator is not supported: gt',
        '`find` throws an error for when requesting unsupported enum filter operators'
      );
    }
  });

  test('find - tableSource', async function(this: TestContext, assert) {
    assert.expect(1);

    const factDimColumn = 'table1.dimension2';
    const lookupDimColumn = 'table0.dimension0';

    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById('dimension', factDimColumn, 'elideTwo') as DimensionMetadataModel
    };

    const expectedRequest: RequestV2 = {
      columns: [{ field: lookupDimColumn, parameters: {}, type: 'dimension' }],
      filters: [
        {
          field: lookupDimColumn,
          parameters: {},
          type: 'dimension',
          operator: 'in',
          values: ['v1', 'v2']
        }
      ],
      sorts: [],
      table: lookupDimColumn.split('.')[0],
      limit: null,
      dataSource: 'elideTwo',
      requestVersion: '2.0'
    };

    assertRequest(this, (request, _options) => {
      assert.deepEqual(request, expectedRequest, '`tableSource`, when available, is used to lookup dimension values');
    });

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');
    await adapter.find(TestDimensionColumn, [{ operator: 'in', values: ['v1', 'v2'] }]);
  });

  test('all', async function(this: TestContext, assert) {
    assert.expect(2);

    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension0',
        'elideTwo'
      ) as DimensionMetadataModel,
      parameters: {
        foo: 'baz'
      }
    };
    const expectedRequest: RequestV2 = {
      columns: [{ field: 'table0.dimension0', parameters: { foo: 'baz' }, type: 'dimension' }],
      filters: [],
      sorts: [],
      table: 'table0',
      limit: null,
      dataSource: 'elideTwo',
      requestVersion: '2.0'
    };
    const expectedOptions = {
      timeout: 30000
    };

    assertRequest(this, (request, options) => {
      assert.deepEqual(
        request,
        expectedRequest,
        'Correct request is sent to elide fact adapter for all dimension values'
      );
      assert.deepEqual(options, expectedOptions, 'Options are passed through to the fact adapter');
    });

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');
    await adapter.all(TestDimensionColumn, expectedOptions);
  });

  test('all - enum', async function(this: TestContext, assert) {
    assert.expect(1);

    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension1',
        'elideTwo'
      ) as DimensionMetadataModel
    };

    assertRequest(this, (_request, _options) => {
      assert.notOk(true, 'Elide dimensions with enum values should not make network requests');
    });

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');
    const response = await adapter.all(TestDimensionColumn);
    assert.deepEqual(
      extractDimValues(TestDimensionColumn, response),
      [
        'Practical Frozen Fish (enum)',
        'Practical Concrete Chair (enum)',
        'Awesome Steel Chicken (enum)',
        'Tasty Fresh Towels (enum)',
        'Intelligent Steel Pizza (enum)'
      ],
      'all returns enum values for dimensions that provide them'
    );
  });

  test('search', async function(this: TestContext, assert) {
    assert.expect(2);

    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension0',
        'elideOne'
      ) as DimensionMetadataModel,
      parameters: {
        bang: 'boom'
      }
    };
    const query = 'something';

    const expectedRequest: RequestV2 = {
      columns: [{ field: 'table0.dimension0', parameters: { bang: 'boom' }, type: 'dimension' }],
      filters: [
        {
          field: 'table0.dimension0',
          parameters: { bang: 'boom' },
          type: 'dimension',
          operator: 'eq',
          values: ['*something*']
        }
      ],
      sorts: [],
      table: 'table0',
      limit: null,
      dataSource: 'elideOne',
      requestVersion: '2.0'
    };
    const expectedOptions = {
      timeout: 30000,
      perPage: 48
    };

    assertRequest(this, (request, options) => {
      assert.deepEqual(
        request,
        expectedRequest,
        'Correct request is sent to elide fact adapter for search of dimension values'
      );

      assert.deepEqual(options, expectedOptions, 'Options are passed through to the fact adapter');
    });

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');
    await adapter.search(TestDimensionColumn, query, expectedOptions);
  });

  test('search - enum', async function(this: TestContext, assert) {
    assert.expect(1);

    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension1',
        'elideOne'
      ) as DimensionMetadataModel
    };

    assertRequest(this, (_request, _options) => {
      assert.notOk(true, 'Elide dimensions with enum values should not make network requests');
    });

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');
    const query = 'act';
    const response = await adapter.search(TestDimensionColumn, query);
    assert.deepEqual(
      extractDimValues(TestDimensionColumn, response),
      ['Practical Frozen Fish (enum)', 'Practical Concrete Chair (enum)'],
      '`search` returns filtered enum values for dimensions that provide them'
    );
  });
});
